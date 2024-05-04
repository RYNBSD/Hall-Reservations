import type { NextFunction, Request, Response } from "express";
import type { Transaction } from "sequelize";
import type { TResponse } from "../../types/index.js";
import { model } from "../../model/index.js";
import { StatusCodes } from "http-status-codes";
import { schema } from "../../schema/index.js";
import { HALL_SERVICE_TYPE } from "../../constant/enum.js";

const { Hall: One, Create, Update, Remove } = schema.user.hall;

export default {
  async all(
    _req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>,
    _next: NextFunction,
    transaction: Transaction
  ) {
    const user = res.locals.user!;

    const { Hall, HallImages } = model.db;
    const halls = await Hall.findAll({
      where: { userId: user.dataValues.id },
      include: {
        model: HallImages,
        required: true,
      },
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

    const user = res.locals.user!;
    const { Hall, HallImages, HallServices } = model.db;

    const hall = await Hall.findOne({
      where: { userId: user.dataValues.id, id },
      plain: true,
      include: [
        {
          model: HallImages,
          required: true,
        },
        {
          model: HallServices,
        },
      ],
      transaction,
    });
    if (hall === null) throw new Error("Hall not exists");

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        hall: hall.dataValues,
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
    const {
      name,
      description,
      location,
      price,
      people,
      servicesName,
      servicesPrice,
      servicesType,
    } = Body.parse(req.body);

    const user = res.locals.user!;
    const { Hall, HallImages, HallServices } = model.db;

    const hall = await Hall.create(
      {
        name,
        description,
        location,
        price,
        people,
        userId: user.dataValues.id,
      },
      {
        fields: [
          "name",
          "description",
          "location",
          "price",
          "people",
          "userId",
        ],
        returning: true,
        transaction,
      }
    );

    const files = req.files!;
    if (Array.isArray(files)) throw new Error("Invalid files");

    const images = files.images;
    const imagesArr = images
      .filter(
        (image) =>
          image.mimetype.toLowerCase().startsWith("image/") &&
          image.buffer.length > 0
      )
      .map(
        (image) =>
          `data:${image.mimetype};base64,${image.buffer.toString("base64")}`
      );

    if (imagesArr.length === 0) throw new Error("Please provide images");
    await HallImages.bulkCreate(
      imagesArr.map((image) => ({ hallId: hall.dataValues.id, image })),
      { fields: ["hallId", "image"], transaction }
    );

    const servicesNameArr = servicesName
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    if (servicesName.split(",").length !== servicesNameArr.length)
      throw new Error("Invalid services name");

    const servicesPriceArr = servicesPrice
      .split(",")
      .map((price) => parseInt(price.trim()))
      .filter((price) => !isNaN(price) && price > 0);
    if (servicesPrice.split(",").length !== servicesPriceArr.length)
      throw new Error("Invalid services price");

    const servicesTypeArr = servicesType
      .split(",")
      .map((type) => type.trim().toLowerCase())
      .filter((type) => HALL_SERVICE_TYPE.includes(type));
    if (servicesType.split(",").length !== servicesTypeArr.length)
      throw new Error("invalid services type");

    if (
      servicesNameArr.length !== servicesPriceArr.length ||
      servicesPriceArr.length !== servicesTypeArr.length
    )
      throw new Error("Incompatible service options");

    const servicesImage = files.servicesImage;
    const servicesImageArr = servicesImage
      .filter(
        (image) =>
          image.mimetype.toLowerCase().startsWith("image/") &&
          image.buffer.length > 0
      )
      .map(
        (image) =>
          `data:${image.mimetype};base64,${image.buffer.toString("base64")}`
      );
    if (servicesImage.length !== servicesImageArr.length)
      throw new Error("Invalid services image");

    if (servicesImage.length !== servicesNameArr.length)
      throw new Error("Incompatible image with services");

    const servicesBulk = [];
    for (let i = 0; i < servicesNameArr.length; i++) {
      servicesBulk.push({
        name: servicesNameArr[i],
        price: servicesPriceArr[i],
        type: servicesTypeArr[i] as (typeof HALL_SERVICE_TYPE)[number],
        image: servicesImageArr[i],
        hallId: hall.dataValues.id,
      });
    }

    const services = await HallServices.bulkCreate(servicesBulk, {
      fields: ["name", "price", "image", "type", "hallId"],
      transaction,
      returning: true,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        hall: hall.dataValues,
        images: imagesArr,
        services: services.map((service) => service.dataValues),
      },
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
    const {
      name,
      description,
      location,
      price,
      people,
      servicesName,
      servicesPrice,
      servicesType,
    } = Body.parse(req.body);

    const user = res.locals.user!;
    const { Hall, HallImages, HallServices } = model.db;

    const hall = await Hall.findOne({
      where: { id, userId: user.dataValues.id },
      plain: true,
      limit: 1,
      transaction,
    });
    if (hall === null) throw new Error("Hall not found");

    await hall.update(
      { name, description, location, price, people },
      {
        fields: ["name", "description", "location", "price", "people"],
        returning: true,
        transaction,
      }
    );

    await HallImages.destroy({
      force: true,
      where: { hallId: hall.dataValues.id },
      transaction,
    });

    const files = req.files!;
    if (Array.isArray(files)) throw new Error("Invalid files");

    const images = files.images;
    const imagesArr = images
      .filter(
        (image) =>
          image.mimetype.toLowerCase().startsWith("image/") &&
          image.buffer.length > 0
      )
      .map(
        (image) =>
          `data:${image.mimetype};base64,${image.buffer.toString("base64")}`
      );
    await HallImages.bulkCreate(
      imagesArr.map((image) => ({ hallId: hall.dataValues.id, image })),
      { fields: ["hallId", "image"], transaction }
    );

    const imagesList = await HallImages.findAll({
      where: { hallId: hall.dataValues.id },
      transaction,
    });

    await HallServices.destroy({
      force: true,
      where: { hallId: hall.dataValues.id },
      transaction,
    });

    const servicesNameArr = servicesName
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    if (
      servicesName.length > 0 &&
      servicesName.split(",").length !== servicesNameArr.length
    )
      throw new Error("Invalid services name");

    const servicesPriceArr = servicesPrice
      .split(",")
      .map((price) => parseInt(price.trim()))
      .filter((price) => !isNaN(price) && price > 0);
    if (
      servicesPrice.length > 0 &&
      servicesPrice.split(",").length !== servicesPriceArr.length
    )
      throw new Error("Invalid services price");

    const servicesTypeArr = servicesType
      .split(",")
      .map((type) => type.trim().toLowerCase())
      .filter((type) => HALL_SERVICE_TYPE.includes(type));
    if (
      servicesType.length > 0 &&
      servicesType.split(",").length !== servicesTypeArr.length
    )
      throw new Error("invalid services type");

    if (
      servicesNameArr.length !== servicesPriceArr.length ||
      servicesPriceArr.length !== servicesTypeArr.length
    )
      throw new Error("Incompatible service options");

    const servicesImage = files.servicesImage;
    let servicesImageArr: string[] = [];

    if (servicesImage && servicesImage.length > 0) {
      servicesImageArr = servicesImage
        .filter(
          (image) =>
            image.mimetype.toLowerCase().startsWith("image/") &&
            image.buffer.length > 0
        )
        .map(
          (image) =>
            `data:${image.mimetype};base64,${image.buffer.toString("base64")}`
        );
      if (servicesImage.length !== servicesImageArr.length)
        throw new Error("Invalid services image");

      if (servicesImage.length !== servicesNameArr.length)
        throw new Error("Incompatible image with services");
    }

    const servicesBulk = [];
    for (let i = 0; i < servicesNameArr.length; i++) {
      servicesBulk.push({
        name: servicesNameArr[i],
        price: servicesPriceArr[i],
        type: servicesTypeArr[i] as (typeof HALL_SERVICE_TYPE)[number],
        image: servicesImageArr[i],
        hallId: hall.dataValues.id,
      });
    }

    await HallServices.bulkCreate(servicesBulk, {
      fields: ["name", "price", "image", "type", "hallId"],
      transaction,
      returning: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        hall: hall.dataValues,
        images: imagesList.map((image) => image.dataValues.image),
      },
    });
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
    const { Hall } = model.db;

    const hall = await Hall.findOne({
      where: { userId: user.dataValues.id, id },
      plain: true,
      limit: 1,
      transaction,
    });
    if (hall === null) throw new Error("Hall don't exists");

    await hall.destroy({
      force: true,
      transaction,
    });
    res.status(StatusCodes.OK).json({
      success: true,
    });
  },
} as const;
