import { Router } from "express";
import { controller } from "../../controller/index.js";
import { util } from "../../util/index.js";
import { config } from "../../config/index.js";

export const reservations = Router();

const { all, reservation, create, update, remove } =
  controller.user.reservations;
const { handleAsync } = util.fn;
const { upload } = config;

reservations.get("/", handleAsync(all));

reservations.get("/:id", handleAsync(reservation));

reservations.post("/", handleAsync(upload.none()), handleAsync(create));

reservations.put("/:id", handleAsync(upload.none()), handleAsync(update));

reservations.delete("/:id", handleAsync(remove));
