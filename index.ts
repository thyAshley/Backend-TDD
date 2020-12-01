import app from "./src/app";

import { sequelize } from "./src/db/database";

sequelize.sync({ force: true });

app.listen(3000, () => {
  console.log("Backend started on port 3000");
});
