import type { NextFunction, Request, Response } from "express";
import type { Transaction } from "sequelize";
import type { TResponse } from "../types/index.js";
import { model } from "../model/index.js";
import { StatusCodes } from "http-status-codes";
import { schema } from "../schema/index.js";
import { util } from "../util/index.js";

const { SignUp, SignIn } = schema.auth;

export default {
  async signUp(
    req: Request,
    res: Response<TResponse["Body"]["Success"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const { Body } = SignUp;
    const { username, email, phone, password, role } = Body.parse(req.body);

    const { User } = model.db;
    const { bcrypt } = util;
    const user = await User.create(
      { username, email, phone, password: bcrypt.hash(password), role },
      {
        fields: ["username", "email", "phone", "password", "role"],
        returning: true,
        transaction,
      }
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        user: user.dataValues,
      },
    });
  },
  async signIn(
    req: Request,
    res: Response<TResponse["Body"]["Success"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const { Body } = SignIn;
    const { email, password } = Body.parse(req.body);

    const { User } = model.db;
    const user = await User.findOne({
      where: { email },
      limit: 1,
      plain: true,
      transaction,
    });
    if (user === null) throw new Error("User nor found");

    const { bcrypt } = util;
    if (!bcrypt.compare(password, user.dataValues.password))
      throw new Error("Invalid password");

    req.session.user = { id: user.dataValues.id };
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user: user.dataValues,
      },
    });
  },
  async signOut(req: Request, res: Response<TResponse["Body"]["Success"]>) {
    req.session.user = { id: 0 };
    res.status(StatusCodes.OK).json({
      success: true,
    });
  },
} as const;
