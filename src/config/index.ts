import db from "./db.js";
import { upload } from "./upload.js";

export const config = {
  db,
  upload,
} as const;
