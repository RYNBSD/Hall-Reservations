import { Router } from "express";
import { util } from "../util/index.js";
import { controller } from "../controller/index.js";
import { config } from "../config/index.js";
import { middleware } from "../middleware/index.js";

export const auth = Router();

const { isAuthenticated, isNotAuthenticated } = middleware.fn;
const { signUp, signIn, signOut } = controller.auth;
const { handleAsync } = util.fn;
const { upload } = config;

auth.post(
  "/sign-up",
  handleAsync(isNotAuthenticated),
  handleAsync(upload.none()),
  handleAsync(signUp)
);

auth.post(
  "/sign-in",
  handleAsync(isNotAuthenticated),
  handleAsync(upload.none()),
  handleAsync(signIn)
);

auth.post(
  "/sign-out",
  handleAsync(isAuthenticated),
  handleAsync(upload.none()),
  handleAsync(signOut)
);
