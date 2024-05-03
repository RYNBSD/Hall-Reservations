import { Router } from "express";
import { util } from "../../util/index.js";
import { controller } from "../../controller/index.js";
import { config } from "../../config/index.js";
import { middleware } from "../../middleware/index.js";
import { halls } from "./halls.js";
import { reservations } from "./reservations.js";

export const user = Router();

const { profile, update, remove } = controller.user;
const { isOwner } = middleware.user;
const { handleAsync } = util.fn;
const { upload } = config;

user.get("/", handleAsync(profile));

user.put("/", handleAsync(upload.none()), handleAsync(update));

user.delete("/", handleAsync(remove));

user.use("/reservations", reservations);

user.use("/halls", handleAsync(isOwner), halls);
