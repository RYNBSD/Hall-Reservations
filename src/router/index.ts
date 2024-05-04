import { Router } from "express";
import { auth } from "./auth.js";
import { halls } from "./halls.js"
import { user } from "./user/index.js";
import { middleware } from "../middleware/index.js";
import { util } from "../util/index.js";

export const router = Router();

const { isAuthenticated } = middleware.fn
const { handleAsync } = util.fn

router.use("/auth", auth);
router.use("/hall", halls);
router.use("/user", handleAsync(isAuthenticated), user);
