import express from "express";
import { check } from "express-validator";
import { tokenAuthentication } from "../middleware/tokenAuthentication";

import { login, logUserOut } from "../controllers/authController";

const router = express.Router();

router.post("/", check("email").isEmail(), login);
router.post("/logout", tokenAuthentication, logUserOut);

export default router;
