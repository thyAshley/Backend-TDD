import express from "express";
import { check } from "express-validator";
import multer from "multer";

import { pagination } from "../middleware/paginationMiddleware";
import * as HoaxController from "../controllers/hoaxController";

const router = express.Router();

const upload = multer();

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

router.post(
  "/attachments",
  upload.single("file"),
  HoaxController.addAttachment
);

export default router;
