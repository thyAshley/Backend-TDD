import express, { Request, Response, NextFunction } from "express";

import userRoutes from "./routes/userRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/users", userRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.json({ ...err });
});
export default app;
