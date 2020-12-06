import express from "express";
import { check } from "express-validator";

import {
  login,
  logUserOut,
  resetPassword,
} from "../controllers/authController";

const router = express.Router();

router.post("/", check("email").isEmail(), login);
router.post(
  "/forgot-password",
  check("email").isEmail().withMessage("Email is not valid"),
  resetPassword
);
router.post("/logout", logUserOut);

export default router;
