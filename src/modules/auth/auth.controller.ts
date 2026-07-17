

import { prisma } from "../../lib/prisma";
import { status } from "http-status";
import bcrypt from "bcryptjs";
import { IUserLoginPayload, IUserPayload } from "./auth.interface";
import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/interface";
import { authService } from "./auth.services";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";


const registerUser = catchAsync(async (req: Request, res: Response) => {

  console.log("THIS IS THE req.body", req.body);
  const result = await authService.registerUser(req.body);
  console.log("THIS IS THE RESULT", result);
  const { userData, accessToken, refreshToken } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "User created successfully",
    data: {
      userData,
      accessToken,
      refreshToken,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);

  const { userData, accessToken, refreshToken } = result;

  // console.log('THIS IS THE USER DATA',userData)
  // console.log('THIS IS THE ACCESS TOKEN',accessToken)
  // console.log('THIS IS THE REFRESH TOKEN',refreshToken)

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      userData,
      accessToken,
      refreshToken,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await authService.getMe(user);

  // console.log('THIS IS THE USER',user)
  // console.log('THIS IS THE RESULT',result)
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

export const authController = { loginUser, registerUser, getMe };
