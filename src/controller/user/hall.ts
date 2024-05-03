import { Request, Response } from "express";
import type { TResponse } from "../../types/index.js";
import { model } from "../../model/index.js";
import { StatusCodes } from "http-status-codes";
import { schema } from "../../schema/index.js";

const { Create, Update, Remove } = schema.user.hall;

export default {
  async all(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {},
  async hall(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {},
  async create(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {
    const { Body } = Create;
    const { name, description, location, price, people } = Body.parse(req.body);

    const user = res.locals.user!;
    const { Hall, HallImages } = model.db;

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
      }
    );

    const images = req.files;
    if (!Array.isArray(images)) throw new Error("Invalid images");

    const imagesArr = images
      .filter(
        (image) =>
          image.mimetype.toLowerCase().startsWith("image/") &&
          image.buffer.length > 0
      )
      .map((image) => Buffer.from(image.buffer).toString("base64url"));

    if (imagesArr.length === 0) throw new Error("Please provide images");

    await HallImages.bulkCreate(
      imagesArr.map((image) => ({ hallId: hall.dataValues.id, image })),
      { fields: ["hallId", "image"] }
    );
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        hall: hall.dataValues,
        images: imagesArr,
      },
    });
  },
  async update(
    req: Request,
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {
    const { Body, Params } = Update;
    const { id } = Params.parse(req.params);
    const { name, description, location, price, people, removedImages } =
      Body.parse(req.body);

    const user = res.locals.user!;
    const { Hall, HallImages } = model.db;

    const hall = await Hall.findOne({
      where: { id, userId: user.dataValues.id },
      plain: true,
      limit: 1,
    });
    if (hall === null) throw new Error("Hall not found");

    await hall.update(
      { name, description, location, price, people },
      {
        fields: ["name", "description", "location", "price", "people"],
        returning: true,
      }
    );

    const removedImagesArr = removedImages
      .split(",")
      .map((image) => parseInt(image.trim()))
      .filter((image) => !isNaN(image) || image === 0);
    await HallImages.destroy({
      force: true,
      where: { hallId: hall.dataValues.id, id: removedImagesArr },
    });

    const images = req.files;
    if (!Array.isArray(images)) throw new Error("Invalid images");

    const imagesArr = images
      .filter(
        (image) =>
          image.mimetype.toLowerCase().startsWith("image/") &&
          image.buffer.length > 0
      )
      .map((image) => Buffer.from(image.buffer).toString("base64url"));
    await HallImages.bulkCreate(
      imagesArr.map((image) => ({ hallId: hall.dataValues.id, image })),
      { fields: ["hallId", "image"] }
    );

    const imagesList = await HallImages.findAll({
      where: { hallId: hall.dataValues.id },
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
    res: Response<TResponse["Body"]["Success"], TResponse["Locals"]>
  ) {
    const { Params } = Remove;
    const { id } = Params.parse(req.params);

    const user = res.locals.user!;
    const { Hall } = model.db;

    const hall = await Hall.findOne({
      where: { userId: user.dataValues.id, id },
      plain: true,
      limit: 1,
    });
    if (hall === null) throw new Error("Hall don't exists");

    await hall.destroy({
      force: true,
    });
    res.status(StatusCodes.OK).json({
      success: true,
    });
  },
} as const;
