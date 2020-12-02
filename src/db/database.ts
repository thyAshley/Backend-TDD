import { Sequelize } from "sequelize";
import config from "config";

const dbConfig = config.get<any>("database");
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    dialect: dbConfig.dialect,
    storage: dbConfig.storage,
    logging: dbConfig.logging,
  }
);
