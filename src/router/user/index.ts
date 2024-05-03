import { Router } from "express";
import { util } from "../../util/index.js";
import { middleware } from "../../middleware/index.js";
import controller from "../../controller/index.js";

export const user = Router();

const { profile, update, remove } = controller.user;
const { isAuthenticated } = middleware.fn;
const { handleAsync } = util.fn;

user.get("/", handleAsync(isAuthenticated), handleAsync(profile));

user.put("/", handleAsync(isAuthenticated), handleAsync(update));

user.put("/", handleAsync(isAuthenticated), handleAsync(remove));
