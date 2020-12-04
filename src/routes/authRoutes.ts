import express from "express";
import { check } from "express-validator";

import { login } from "../controllers/authController";

const router = express.Router();

router.post("/", check("email").isEmail(), login);

export default router;
