import app from "./src/app";
import * as TokenService from "./src/utils/TokenService";
import { sequelize } from "./src/db/database";
import logger from "./src/utils/logger";

TokenService.scheduleCleanup();

sequelize.sync();

app.listen(process.env.PORT || 3001, () => {
  logger.info(
    `Backend started on port ${process.env.PORT || 3001}, version: ` +
      process.env.npm_package_version
  );
});
