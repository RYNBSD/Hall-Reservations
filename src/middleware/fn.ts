import type { Request, Response, NextFunction } from "express";
import { model } from "../model/index.js";

export async function isAuthenticated(
  req: Request,
  res: Response<never>,
  next: NextFunction
) {
  const id = req.session.user?.id ?? 0;

  const { User } = model.db;
  const user = await User.findOne({
    where: { id },
    limit: 1,
    plain: true,
  });
  if (user === null) throw new Error("User not found");

  res.locals = { ...res.locals, user };
  return next();
}

export async function isNotAuthenticated(
  req: Request,
  res: Response<never>,
  next: NextFunction
) {
  const id = req.session.user?.id ?? 0;

  const { User } = model.db;
  const user = await User.findOne({
    where: { id },
    limit: 1,
    plain: true,
  });
  if (user !== null) throw new Error("User already authenticated");

  // res.locals.user = { ...res.locals, user };
  return next();
}
