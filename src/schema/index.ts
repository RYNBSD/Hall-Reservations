import * as db from "./db.js";
import auth from "./auth.js";
import hall from "./hall.js";
import user from "./user/index.js";

export const schema = {
  db,
  auth,
  hall,
  user,
} as const;
