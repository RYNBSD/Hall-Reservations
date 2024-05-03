import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { TResponse } from "../types/index.js";
import { StatusCodes } from "http-status-codes";

type handleAsyncFn =
  | ((req: Request, res: Response, next: NextFunction) => Promise<void>)
  | RequestHandler;

export function handleAsync(fn: handleAsyncFn) {
  return async (
    req: Request,
    res: Response<TResponse["Body"]["Fail"]>,
    next: NextFunction
  ) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : `${error}`,
      });
    }
  };
}
