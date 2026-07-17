import { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma";

import status from "http-status";
import "dotenv/config";
import { JwtPayload } from "jsonwebtoken";
import { IRequestUser } from "../interfaces/interface";
import AppError from "../errorHelpers/AppError";
import { jwtUtils } from "../utils/jwt";
import { Role } from "@prisma/client";

const secret = process.env.JWT_SECRET as string;

const auth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = req.headers.authorization?.split(" ")[1];

      if (!req.headers.authorization) {
        token = req.cookies.token;
      }

      if (!token) {
        throw new AppError(status.UNAUTHORIZED, "Token not found!!");
      }

      const decoded = jwtUtils.verifyToken(token, secret) as JwtPayload;

      //console.log('DECODED:"',decoded)

      if (!decoded.success || !decoded.data.userId) {
        throw new AppError(status.UNAUTHORIZED, decoded.message);
      }

      const userData = await prisma.user.findUnique({
        where: {
          id: decoded.data.userId,
        },
      });
      if (!userData) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized!");
      }

      if (roles.length && !roles.includes(userData.role)) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized!!!");
      }

      req.user = {
        id: userData.id,
        role: userData.role,
        email: userData.email,
      } as IRequestUser;

      next();
    } catch (error: any) {
      console.log(error.message);
      next(error);
    }
  };
};

export default auth;
