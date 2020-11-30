import express from "express";
import { check } from "express-validator";

import { registerUser } from "../controllers/userController";
const route = express.Router();

route.post(
  "/",
  check("username")
    .notEmpty()
    .withMessage("Username cannot be null")
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage("Username must be between 4 and 32 characters"),
  check("email", "Email cannot be null")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("Email is not valid"),
  check("password", "Password cannot be null").notEmpty(),
  registerUser
);

export default route;
