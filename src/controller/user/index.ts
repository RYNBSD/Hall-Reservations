import type { NextFunction, Request, Response } from "express";
import type { Transaction } from "sequelize";
import type { TResponse } from "../../types/index.js";
import { StatusCodes } from "http-status-codes";
import { model } from "../../model/index.js";
import reservations from "./reservations.js";
import halls from "./halls.js";

export default {
  async profile(
    _req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const user = res.locals.user!;

    const { UserReservations, Hall } = model.db;
    const reservations = await UserReservations.findAll({
      where: { userId: user.dataValues.id },
      include: {
        model: Hall,
      },
      transaction,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user: user.dataValues,
        reservations: reservations.map((reservation) => reservation.dataValues),
      },
    });
  },
  async update(
    _req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const user = res.locals.user!;

    await user.update({}, { transaction });
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user: user.dataValues,
      },
    });
  },
  async remove(
    _req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const user = res.locals.user!;
    await user.destroy({ force: true, transaction }),
      res.status(StatusCodes.OK).json({
        success: true,
      });
  },
  reservations,
  halls,
} as const;
