import express from "express";
import { check } from "express-validator";
import { pagination } from "../middleware/paginationMiddleware";
import * as HoaxController from "../controllers/hoaxController";

const router = express.Router();

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

router.post("/attachments", HoaxController.addAttachment);

export default router;
