import type { NextFunction, Request, Response } from "express";
import type { TResponse } from "../../types/index.js";
import { model } from "../../model/index.js";
import { StatusCodes } from "http-status-codes";
import { schema } from "../../schema/index.js";
import { Op, type Transaction } from "sequelize";

const { Reservation, Create, Update, Remove } = schema.user.reservations;

export default {
  async all(
    _req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const user = res.locals.user!;

    const { UserReservations, Hall, HallImages } = model.db;
    const reservations = await UserReservations.findAll({
      where: { userId: user.dataValues.id },
      include: {
        model: Hall,
        include: [
          {
            model: HallImages,
          },
        ],
      },
      transaction,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        reservations: reservations.map((reservation) => reservation.dataValues),
      },
    });
  },
  async reservation(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const { Params } = Reservation;
    const { id } = Params.parse(req.params);

    const user = res.locals.user!;
    const {
      UserReservations,
      User,
      UserReservationServices,
      Hall,
      HallImages,
      HallServices,
    } = model.db;
    const reservation = await UserReservations.findOne({
      where: { userId: user.dataValues.id, id },
      include: [
        {
          model: User,
        },
        {
          model: UserReservationServices,
          include: [
            {
              model: HallServices,
            },
          ],
        },
        {
          model: Hall,
          include: [
            {
              model: HallImages,
            },
          ],
        },
      ],
      transaction,
    });
    if (reservation === null) throw new Error("Reservation don't exists");

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        reservation: reservation.dataValues,
      },
    });
  },
  async create(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const { Body } = Create;
    const { hallId, start, end, services } = Body.parse(req.body);

    if (start.getTime() > end.getTime())
      throw new Error("Start date is greater then end date");
    else if (start.getTime() === end.getTime())
      throw new Error("Start date is equal to end date");
    const user = res.locals.user!;
    const { UserReservations, UserReservationServices, HallServices } =
      model.db;

    const isReservationExists = await UserReservations.findOne({
      where: {
        hallId,
        [Op.or]: [
          { start: { [Op.between]: [start, end] } },
          { end: { [Op.between]: [start, end] } },
        ],
      },
      plain: true,
      limit: 1,
      transaction,
    });
    if (isReservationExists !== null)
      throw new Error("reservation already exists");

    const reservation = await UserReservations.create(
      {
        userId: user.dataValues.id,
        hallId,
        start,
        end,
      },
      {
        fields: ["userId", "hallId", "start", "end"],
        returning: true,
        transaction,
      }
    );

    const servicesArr = services
      .split(",")
      .map((service) => parseInt(service.trim()))
      .filter((service) => !isNaN(service) && service > 0);

    const checkServices = await Promise.all(
      servicesArr.map((service) =>
        HallServices.findOne({
          where: { hallId, id: service },
          plain: true,
          limit: 1,
          transaction,
        })
      )
    );
    if (checkServices.includes(null)) throw new Error("Service don't exists");

    await UserReservationServices.bulkCreate(
      servicesArr.map((service) => ({
        serviceId: service,
        reservationId: reservation.dataValues.id,
      })),
      { fields: ["reservationId", "serviceId"], transaction }
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
    });
  },
  async update(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const { Body, Params } = Update;
    const { id } = Params.parse(req.params);
    const { start, end, services, removedServices } = Body.parse(req.body);

    if (start.getTime() > end.getTime())
      throw new Error("Start date is greater then end date");
    else if (start.getTime() === end.getTime())
      throw new Error("Start date is equal to end date");

    const user = res.locals.user!;
    const { UserReservations, UserReservationServices, HallServices } =
      model.db;

    const reservation = await UserReservations.findOne({
      where: {
        id,
        userId: user.dataValues.id,
      },
      plain: true,
      limit: 1,
      transaction,
    });
    if (reservation === null) throw new Error("Reservation don't exists");

    const isReservationExists = await UserReservations.findOne({
      where: {
        hallId: reservation.dataValues.hallId,
        [Op.or]: [
          { start: { [Op.between]: [start, end] } },
          { end: { [Op.between]: [start, end] } },
        ],
      },
      plain: true,
      limit: 1,
      transaction,
    });
    if (isReservationExists !== null)
      throw new Error("reservation already exists");

    reservation.update(
      {
        start,
        end,
      },
      {
        fields: ["start", "end"],
        returning: true,
        transaction,
      }
    );
    await UserReservationServices.destroy({
      force: true,
      where: {
        serviceId: removedServices
          .split(",")
          .map((service) => parseInt(service.trim()))
          .filter((service) => !isNaN(service) && service > 0),
      },
      transaction,
    });

    const servicesArr = services
      .split(",")
      .map((service) => Number(service.trim()))
      .filter((service) => !isNaN(service) && service > 0);
    const checkServices = await Promise.all(
      servicesArr.map((service) =>
        HallServices.findOne({
          where: { hallId: reservation.dataValues.hallId, id: service },
          plain: true,
          limit: 1,
          transaction,
        })
      )
    );
    if (checkServices.includes(null)) throw new Error("Service don't exists");

    await Promise.all(
      servicesArr.map((service) =>
        UserReservationServices.findOrCreate({
          where: {
            serviceId: service,
            reservationId: reservation.dataValues.id,
          },
          defaults: {
            serviceId: service,
            reservationId: reservation.dataValues.id,
          },
          fields: ["serviceId", "reservationId"],
          transaction,
        })
      )
    );

    res.status(StatusCodes.OK).json({ success: true });
  },
  async remove(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const { Params } = Remove;
    const { id } = Params.parse(req.params);

    const user = res.locals.user!;
    const { UserReservations } = model.db;

    const reservation = await UserReservations.findOne({
      where: {
        id,
        userId: user.dataValues.id,
      },
      plain: true,
      limit: 1,
      transaction,
    });
    if (reservation === null) throw new Error("Reservation don't exists");

    await reservation.destroy({
      force: true,
      transaction,
    });
    res.status(StatusCodes.OK).json({
      success: true,
    });
  },
} as const;
