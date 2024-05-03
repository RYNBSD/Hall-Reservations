import * as db from "./db.js";
import auth from "./auth.js";

export const schema = {
  db,
  auth,
} as const;
