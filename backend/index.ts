import app from "./src/app";
import * as TokenService from "./src/utils/TokenService";
import { sequelize } from "./src/db/database";

TokenService.scheduleCleanup();

sequelize.sync();

app.listen(3000, () => {
  console.log("Backend started on port 3000");
});
