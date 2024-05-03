import { Router } from "express";
import { auth } from "./auth.js";
import { user } from "./user/index.js";

export const router = Router();

router.use("/auth", auth);
router.use("/user", user);
// router.use("/hall");
