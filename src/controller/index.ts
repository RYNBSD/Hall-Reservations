import auth from "./auth.js";
import halls from "./halls.js";
import user from "./user/index.js";

export const controller = {
  auth,
  halls,
  user,
} as const;
