import path from "node:path";
import { Sequelize } from "sequelize";

export default {
  async connect() {
    const sequelize = new Sequelize({
      dialect: "sqlite",
      storage: path.join(__root, "db.sqlite"),
      logging: !IS_PRODUCTION,
      benchmark: !IS_PRODUCTION,
    });
    await sequelize.authenticate();
    global.sequelize = sequelize;
  },
  async init() {
    await global.sequelize.sync({ force: !IS_PRODUCTION })
  }
} as const;
