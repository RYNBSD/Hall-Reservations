import type { Request, Response } from "express";
import type { TResponse } from "../../types/index.js";
import { StatusCodes } from "http-status-codes";
import { model } from "../../model/index.js";

export default {
  async profile(
    _req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {
    const user = res.locals.user!;

    const { UserReservations, Hall } = model.db;
    const reservations = await UserReservations.findAll({
      where: { userId: user.dataValues.id },
      include: {
        model: Hall,
      },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user: user.dataValues,
        reservations: reservations.map((reservation) => reservation.dataValues),
      },
    });
  },
  async update(req: Request, res: Response<TResponse["Body"]["Success"]>) {},
  async remove(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {
    const user = res.locals.user!;
    await user.destroy({ force: true }),
      res.status(StatusCodes.OK).json({
        success: true,
      });
  },
} as const;
