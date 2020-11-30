import app from "./src/app";

import { sequelize } from "./src/db/database";

sequelize.sync();

app.listen(3000, () => {
  console.log("Backend started on port 3000");
});
