import jwt from "jsonwebtoken";
import type { Response } from "express";


/* =========================================================
   JWT PAYLOAD
========================================================= */

export interface JwtPayload {
  userId: string;
  email?: string;
  role: "STUDENT" | "INSTRUCTOR";
}


/* =========================================================
   SECRETS
========================================================= */

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET;

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET;


if (!ACCESS_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET is not defined"
  );
}


if (!REFRESH_TOKEN_SECRET) {
  throw new Error(
    "REFRESH_TOKEN_SECRET is not defined"
  );
}


/* =========================================================
   ACCESS TOKEN
   Valid for 1 day
========================================================= */

export const generateAccessToken = (
  payload: JwtPayload
): string => {

  return jwt.sign(
    payload,
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
};


/* =========================================================
   REFRESH TOKEN
   Normal = 3 days
   Remember Me = 30 days
========================================================= */

export const generateRefreshToken = (
  payload: JwtPayload,
  rememberMe: boolean
): string => {

  return jwt.sign(
    payload,
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: rememberMe
        ? "30d"
        : "3d",
    }
  );
};


/* =========================================================
   VERIFY ACCESS TOKEN
========================================================= */

export const verifyAccessToken = (
  token: string
): JwtPayload => {

  const decoded =
    jwt.verify(
      token,
      ACCESS_TOKEN_SECRET
    ) as JwtPayload;

  return decoded;
};


/* =========================================================
   VERIFY REFRESH TOKEN
========================================================= */

export const verifyRefreshToken = (
  token: string
): JwtPayload => {

  const decoded =
    jwt.verify(
      token,
      REFRESH_TOKEN_SECRET
    ) as JwtPayload;

  return decoded;
};


/* =========================================================
   SET AUTH COOKIES
========================================================= */

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean
): void => {

  const isProduction =
    process.env.NODE_ENV ===
    "production";


  /* =========================
     ACCESS TOKEN
  ========================== */

  res.cookie(
    "scorewell_access_token",
    accessToken,
    {
      httpOnly: true,

      secure:
        isProduction,

      sameSite:
        isProduction
          ? "none"
          : "lax",

      maxAge:
        1 *
        24 *
        60 *
        60 *
        1000,

      path: "/",
    }
  );


  /* =========================
     REFRESH TOKEN
  ========================== */

  res.cookie(
    "scorewell_refresh_token",
    refreshToken,
    {
      httpOnly: true,

      secure:
        isProduction,

      sameSite:
        isProduction
          ? "none"
          : "lax",

      maxAge:
        rememberMe
          ? 30 *
            24 *
            60 *
            60 *
            1000
          : 3 *
            24 *
            60 *
            60 *
            1000,

      path: "/",
    }
  );
};


/* =========================================================
   CLEAR AUTH COOKIES
========================================================= */

export const clearAuthCookies = (
  res: Response
): void => {

  const isProduction =
    process.env.NODE_ENV ===
    "production";


  res.clearCookie(
    "scorewell_access_token",
    {
      httpOnly: true,

      secure:
        isProduction,

      sameSite:
        isProduction
          ? "none"
          : "lax",

      path: "/",
    }
  );


  res.clearCookie(
    "scorewell_refresh_token",
    {
      httpOnly: true,

      secure:
        isProduction,

      sameSite:
        isProduction
          ? "none"
          : "lax",

      path: "/",
    }
  );
};