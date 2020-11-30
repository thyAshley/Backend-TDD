import express from "express";

import { registerUser } from "../controllers/userController";

const route = express.Router();

route.post("/", registerUser);

export default route;
