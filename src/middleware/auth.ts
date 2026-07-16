
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { prisma } from "../lib/prisma";

export const secret = process.env.BETTER_AUTH_SECRET!;
export enum UserRole {
  ADMIN = "ADMIN",
  PROVIDER = "PROVIDER",
  CUSTOMER = "CUSTOMER",
}

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
    
      let token = req.headers.authorization;

      if(!req.headers.authorization){
        token = req.cookies.token
      }

      if (!token ) {
        throw new Error("Token not found!!");
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;

      const userData = await prisma.user.findUnique({
        where: {
          email: decoded.email,
        },
      });
      if (!userData) {
        throw new Error("Unauthorized!");
      }

      if (roles.length && !roles.includes(decoded.role)) {
        throw new Error("Unauthorized!!!");
      }

      req.user = decoded;

      next();
    } catch (error: any) {
      next(error);
    }
  };
};

export default auth;
