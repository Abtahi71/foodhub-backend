

import { prisma } from "../../lib/prisma";
import { status } from "http-status";
import bcrypt from "bcryptjs";
import { IUserLoginPayload, IUserPayload } from "./auth.interface";
import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/interface";


const registerUser = async (payload: IUserPayload) => {
  const { name, email, password } = payload;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hasehdPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hasehdPassword,
    },
  });

  if (!user) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "User could not be created"
    );
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
  });

  const { password: _, ...userData } = user;
  return {
    userData,
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const Me = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!Me) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return Me;
};

const loginUser = async (payload: IUserLoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,

      emailVerified: true,
      password: true,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(status.UNAUTHORIZED, "Invalid credentials");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,

    emailVerified: user.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
 
    emailVerified: user.emailVerified,
  });

  const { password: _, ...userData } = user;

  return {
    userData,
    accessToken,
    refreshToken,
  };
};

export const authController = { loginUser, registerUser, getMe };
