import express from "express";

import { registerUser } from "../controllers/userController";
import {
  validateUsername,
  validateEmail,
} from "../middleware/validationMiddleWare";
const route = express.Router();

route.post("/", validateUsername, validateEmail, registerUser);

export default route;
