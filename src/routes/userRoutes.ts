import express from "express";
import { check } from "express-validator";

import { findByEmail } from "../utils/userUtils";
import {
  registerUser,
  activateUserAccount,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { pagination } from "../middleware/paginationMiddleware";

const router = express.Router();

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router
  .route("/")
  .get(pagination, getAllUsers)
  .post(
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
      .withMessage("Email is not valid")
      .bail()
      .custom(findByEmail),
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
    registerUser
  );

router.post("/activation/:token", activateUserAccount);

export default router;
