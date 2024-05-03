import * as db from "./db.js";
import auth from "./auth.js";
import user from "./user/index.js";

export const schema = {
  db,
  auth,
  user,
} as const;
