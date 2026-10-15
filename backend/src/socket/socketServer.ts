import type { Server as HttpServer } from "http";

import { Server } from "socket.io";

import { verifyAccessToken } from "../auth/authUtils";

const AUTH_COOKIE_NAME = "scorewell_access_token";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

let io: Server | null = null;

/*
 * Reads one cookie from the raw Cookie header,
 * so no extra cookie-parsing package is needed.
 */
const readCookie = (header: string | undefined, name: string): string => {
  if (!header) {
    return "";
  }

  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = part.slice(0, separatorIndex).trim();

    if (key === name) {
      return decodeURIComponent(part.slice(separatorIndex + 1).trim());
    }
  }

  return "";
};

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
    },
  });

  /*
   * Authenticate every socket with the same access-token
   * cookie the REST API uses.
   */
  io.use((socket, next) => {
    try {
      const accessToken = readCookie(
        socket.handshake.headers.cookie,
        AUTH_COOKIE_NAME,
      );

      if (!accessToken) {
        next(new Error("Authentication required."));

        return;
      }

      const decoded = verifyAccessToken(accessToken);

      if (!decoded.userId) {
        next(new Error("Access token is invalid."));

        return;
      }

      socket.data.userId = String(decoded.userId);

      next();
    } catch {
      next(new Error("Access token is invalid or expired."));
    }
  });

  io.on("connection", (socket) => {
    /* One private room per user. */
    socket.join(`user:${socket.data.userId}`);
  });

  return io;
};

export const emitToUser = (
  userId: string,

  event: string,

  payload: unknown,
): void => {
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit(event, payload);
};