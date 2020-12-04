import express, { Request, Response, NextFunction } from "express";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.status).json({
    name: err.name,
    message: err.message,
    path: req.originalUrl,
    timestamp: new Date().getTime(),
  });
});
export default app;
