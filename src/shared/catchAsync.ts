import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      const statusCode = error.statusCode || 500
      console.log(error.message)
      res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "internal server error": error.message,
        error: error.message,
      });
    }
  };
};
