import bcrypt from "bcryptjs";

import app from "./src/app";
import User from "./src/model/User";
import * as TokenService from "./src/utils/TokenService";
import { sequelize } from "./src/db/database";

const createUsers = async (activeCount: number, inactiveCount: number = 0) => {
  for (let i = 0; i < activeCount + inactiveCount; i++) {
    await User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@test.com`,
      password: await bcrypt.hash("P4ssword", 10),
      active: i < activeCount,
    });
  }
};

sequelize.sync({ force: true }).then(async () => {
  createUsers(10, 10);
});

TokenService.scheduleCleanup();

app.listen(3000, () => {
  console.log("Backend started on port 3000");
});
