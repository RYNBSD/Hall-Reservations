import type { Request, Response } from "express";
import type { TResponse } from "../../types/index.js";
import { model } from "../../model/index.js";
import { StatusCodes } from "http-status-codes";
import { schema } from "../../schema/index.js";
import { Op } from "sequelize";

const { Create, Update, Remove } = schema.user.reservations;

export default {
  async all(
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
        reservations: reservations.map((reservation) => reservation.dataValues),
      },
    });
  },
  async reservation(
    _req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {
    const user = res.locals.user!;

    const {
      UserReservations,
      User,
      UserReservationServices,
      Hall,
      HallImages,
    } = model.db;
    const reservation = await UserReservations.findOne({
      where: { userId: user.dataValues.id, id: 0 },
      include: [
        {
          model: User,
        },
        {
          model: UserReservationServices,
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
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {
    const { Body } = Create;
    const { hallId, start, end, services } = Body.parse(req.body);

    if (start.getTime() > end.getTime())
      throw new Error("Start date is grater then end date");
    else if (start.getTime() === end.getTime())
      throw new Error("Start date is equal to end date");
    const user = res.locals.user!;
    const { UserReservations, UserReservationServices } = model.db;

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
      { fields: ["userId", "hallId", "start", "end"], returning: true }
    );

    const servicesArr = services
      .split(",")
      .map((service) => parseInt(service.trim()))
      .filter((service) => !isNaN(service) || service === 0);
    await UserReservationServices.bulkCreate(
      servicesArr.map((service) => ({
        serviceId: service,
        reservationId: reservation.dataValues.id,
      })),
      { fields: ["reservationId", "serviceId"] }
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
    });
  },
  async update(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {
    const { Body, Params } = Update;
    const { id } = Params.parse(req.params);
    const { start, end, services, removedServices } = Body.parse(req.body);

    const user = res.locals.user!;

    const { UserReservations, UserReservationServices } = model.db;

    const reservation = await UserReservations.findOne({
      where: {
        id,
        userId: user.dataValues.id,
      },
      plain: true,
      limit: 1,
    });
    if (reservation === null) throw new Error("Reservation don't exists");

    reservation.update(
      {
        start,
        end,
      },
      {
        fields: ["start", "end"],
        returning: true,
      }
    );
    await UserReservationServices.destroy({
      force: true,
      where: {
        serviceId: removedServices
          .split(",")
          .map((service) => parseInt(service.trim()))
          .filter((service) => !isNaN(service) || service === 0),
      },
    });

    const servicesArr = services
      .split(",")
      .map((service) => Number(service.trim()))
      .filter((service) => !isNaN(service) || service === 0);

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
        })
      )
    );
  },
  async remove(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
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
    });
    if (reservation === null) throw new Error("Reservation don't exists");

    await reservation.destroy({
      force: true,
    });
    res.status(StatusCodes.OK).json({
      success: true,
    });
  },
} as const;
