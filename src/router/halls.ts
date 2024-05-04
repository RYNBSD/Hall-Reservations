import { Router } from "express";
import { controller } from "../controller/index.js";
import { util } from "../util/index.js";

export const halls = Router();

const { all, hall } = controller.halls;
const { handleAsync } = util.fn;

halls.get("/", handleAsync(all));

halls.get("/:id", handleAsync(hall));
