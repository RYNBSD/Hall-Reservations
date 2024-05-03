import type { Sequelize } from "sequelize";

declare global {
  var IS_PRODUCTION: boolean;
  var __root: string;
  var sequelize: Sequelize;

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "production" | "development" | "test";
    }
  }
}

export {};
