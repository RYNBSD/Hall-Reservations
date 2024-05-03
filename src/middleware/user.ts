import type { NextFunction, Request, Response } from "express";
import type { Transaction } from "sequelize";
import type { TResponse } from "../types/index.js";

export async function isOwner(
  _req: Request,
  res: Response<never, TResponse["Locals"]>,
  next: NextFunction,
  _transaction: Transaction
) {
  const user = res.locals.user!;
  if (user.dataValues.role === "owner") return next();
  throw new Error("User must be of type owner");
}
