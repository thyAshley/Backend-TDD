import { Sequelize } from "sequelize";
const config = require("config");

const dbConfig = config.get("database");
console.log(dbConfig);
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
