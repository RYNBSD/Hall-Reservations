import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./src/config/db.js";

global.IS_PRODUCTION = process.env.NODE_ENV === "production";
global.__filename = fileURLToPath(import.meta.url);
global.__dirname = path.dirname(global.__filename);
global.__root = process.cwd();

await db.connect();
const { default: app } = await import("./app.js");
await db.init();

app.listen(8000, () => {
  console.log("Starting");
});
