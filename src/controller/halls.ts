import type { NextFunction, Request, Response } from "express";
import type { Transaction } from "sequelize";
import type { TResponse } from "../types/index.js";
import { StatusCodes } from "http-status-codes";
import { model } from "../model/index.js";
import { schema } from "../schema/index.js";

const { Hall: One } = schema.hall;

export default {
  async all(
    _req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const { Hall, HallImages, HallServices } = model.db;
    const halls = await Hall.findAll({
      include: [{ model: HallImages }, { model: HallServices }],
      transaction,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        halls: halls.map((hall) => hall.dataValues),
      },
    });
  },
  async hall(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const { Params } = One;
    const { id } = Params.parse(req.params);

    const { Hall, HallImages, HallServices } = model.db;
    const halls = await Hall.findAll({
      where: { id },
      include: [{ model: HallImages }, { model: HallServices }],
      transaction,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        halls: halls.map((hall) => hall.dataValues),
      },
    });
  },
} as const;
