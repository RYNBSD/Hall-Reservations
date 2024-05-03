import { Router } from "express";
import { util } from "../../util/index.js";
import { config } from "../../config/index.js";
import { controller } from "../../controller/index.js";

export const halls = Router();

const { all, hall, create, update, remove } = controller.user.halls;
const { handleAsync } = util.fn;
const { upload } = config;

halls.get("/", handleAsync(all));

halls.get("/:id", handleAsync(hall));

halls.post(
  "/",
  handleAsync(upload.fields([{ name: "images" }, { name: "servicesImage" }])),
  handleAsync(create)
);

halls.put("/:id", handleAsync(upload.array("images")), handleAsync(update));

halls.delete("/:id", handleAsync(remove));
