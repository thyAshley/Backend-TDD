import express from "express";
import { check } from "express-validator";

import { registerUser } from "../controllers/userController";
const route = express.Router();

route.post(
  "/",
  check("username", "Username cannot be null").notEmpty(),
  check("email", "Email cannot be null").notEmpty(),
  check("password", "Password cannot be null").notEmpty(),
  registerUser
);

export default route;
