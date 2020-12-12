import express, { NextFunction, Request, Response } from "express";
import { check } from "express-validator";
import multer from "multer";

import { pagination } from "../middleware/paginationMiddleware";
import * as HoaxController from "../controllers/hoaxController";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const upload = multer({ limits: { fileSize: MAX_FILE_SIZE } }).single("file");

const router = express.Router();

router.post(
  "/attachments",
  upload,
  async (
    err: multer.MulterError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err) {
      req.validationErrors = "File size exceeded";
    }
    next();
  },
  HoaxController.addAttachment
);

router
  .route("/")
  .get(pagination, HoaxController.getHoax)
  .post(
    check("content")
      .isLength({ min: 10, max: 500 })
      .withMessage("Hoaxes must be between 10 to 500 character long"),
    HoaxController.createHoax
  );
router.route("/users/:id").get(pagination, HoaxController.getHoaxByUserId);

export default router;
