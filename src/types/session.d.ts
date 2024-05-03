// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SessionData } from "express-session";

interface User {
  user: {
    id: number;
  };
}

declare module "express-session" {
  interface SessionData extends User {}
}
