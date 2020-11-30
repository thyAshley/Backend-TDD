import app from "./src/app";

import { sequelize } from "./src/db/database";

sequelize.sync();
console.log(process.env.NODE_ENV);

app.listen(3000, () => {
  console.log("Backend started on port 3000");
});
