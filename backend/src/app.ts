import express, { Request, Response, NextFunction } from "express";
import config from "config";
import path from "path";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import hoaxRoutes from "./routes/hoaxRoutes";
import { tokenAuthentication } from "./middleware/tokenAuthentication";
import * as FileService from "./utils/FileService";

const uploadDir: string = config.get("uploadDir");
const profileDir: string = config.get("profileDir");
const attachmentDir: string = config.get("attachmentDir");
const profileFolder = path.join(".", uploadDir, profileDir);
const attachmentFolder = path.join(".", uploadDir, attachmentDir);

const ONE_YEAR_IN_TIME = 365 * 24 * 60 * 60 * 1000;
const app = express();
FileService.createFolder();

app.use(express.json({ limit: "3mb" }));
app.use(tokenAuthentication);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/hoaxes", hoaxRoutes);

app.use("/images", express.static(profileFolder, { maxAge: ONE_YEAR_IN_TIME }));
app.use(
  "/attachments",
  express.static(attachmentFolder, { maxAge: ONE_YEAR_IN_TIME })
);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.status).json({
    name: err.name,
    message: err.message,
    path: req.originalUrl,
    timestamp: new Date().getTime(),
  });
});
export default app;
