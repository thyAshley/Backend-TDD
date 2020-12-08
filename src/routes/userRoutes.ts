import express from "express";
import { check } from "express-validator";
import FileType from "file-type";

import { findExistingEmail } from "../utils/userUtils";
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

router
  .route("/:id")
  .get(getUser)
  .put(
    check("username")
      .notEmpty()
      .withMessage("Username cannot be null")
      .bail()
      .isLength({ min: 4, max: 32 })
      .withMessage("Username must be between 4 and 32 characters"),
    check("image").custom(async (imageAsBase64String) => {
      if (imageAsBase64String) {
        const buffer = Buffer.from(imageAsBase64String, "base64");
        if (buffer.toString().length > 2 * 1024 * 1024) {
          throw new Error("Your profile image cannot be bigger than 2MB");
        }
        const type = await FileType.fromBuffer(buffer);
        if (
          !type ||
          (type.mime !== "image/png" && type.mime !== "image/jpeg")
        ) {
          throw new Error("Only JPEG or PNG files are allowed");
        }
      }
      return true;
    }),
    updateUser
  )
  .delete(deleteUser);

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
      .custom(findExistingEmail),
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
