import express, { Request, Response, NextFunction } from "express";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { tokenAuthentication } from "./middleware/tokenAuthentication";
import * as FileService from "./utils/FileService";

const app = express();
FileService.createFolder();

app.use(express.json());
app.use(tokenAuthentication);
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
