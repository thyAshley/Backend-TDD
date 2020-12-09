import express from "express";
import * as HoaxController from "../controllers/hoaxController";

const router = express.Router();

router.route("/").post(HoaxController.createHoax);

export default router;
