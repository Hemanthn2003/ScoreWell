import { io, type Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket: Socket | null = null;

/*
 * One shared connection for the whole app.
 * The JWT cookie is sent automatically (withCredentials).
 */
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
    });
  }

  return socket;
};