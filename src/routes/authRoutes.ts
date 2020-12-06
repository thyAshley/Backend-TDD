import express from "express";
import { check } from "express-validator";

import {
  login,
  logUserOut,
  resetPassword,
  changePasswordWithToken,
} from "../controllers/authController";

const router = express.Router();

router.post("/", check("email").isEmail(), login);
router
  .route("/password")
  .post(
    check("email").isEmail().withMessage("Email is not valid"),
    resetPassword
  )
  .put(
    check("password", "Password cannot be null")
      .notEmpty()
      .bail()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .bail()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      .withMessage(
        "Password must have at least 1 uppercase, 1 lowercase and 1 number"
      ),
    changePasswordWithToken
  );
router.post("/logout", logUserOut);

export default router;
