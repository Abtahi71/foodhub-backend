import { JwtPayload, SignOptions } from "jsonwebtoken";

import { CookieUtils } from "./cookie";
import { Response } from "express";
import { jwtUtils } from "./jwt";

const getAccessToken = (payload: JwtPayload) => {
  //console.log("THIS IS MY JWT SECRET KEY", process.env.JWT_SECRET);
  const accessToken = jwtUtils.createToken(
    payload,
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN } as SignOptions
  );
  return accessToken;
};

const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions
  );
  return refreshToken;
};

const setAccessTokenCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 60 * 24 * 7,
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 60 * 24 * 7,
  });
};

export const tokenUtils = {
  getRefreshToken,
  getAccessToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
};
