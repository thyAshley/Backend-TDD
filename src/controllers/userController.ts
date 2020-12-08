import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import { sendAccountActivation } from "../email/EmailService";
import User from "../model/User";
import * as TokenService from "../utils/TokenService";
import * as FileService from "../utils/FileService";
import {
  activateUserByToken,
  getUsers,
  findUserById,
  updateUserById,
  generateToken,
  deleteUserById,
} from "../utils/userUtils";
import {
  AuthenticationException,
  ForbiddenException,
  NotFoundException,
  UnexpectedException,
} from "../utils/errorUtils";

interface IDictionary {
  [key: string]: string;
}

export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = <IDictionary>{};
    errors
      .array()
      .forEach((error) => (validationErrors[error.param] = error.msg));
    return res.status(400).json({
      validationErrors: validationErrors,
      message: "Validation Failure",
      path: req.originalUrl,
      timestamp: "",
    });
  }
  const { username, email, password } = req.body;

  try {
    const encPassword = await bcrypt.hash(password, 10);
    const activationToken = generateToken();
    await User.create({
      username,
      email,
      password: encPassword,
      activationToken,
    });
    await sendAccountActivation(email, activationToken);
    return res.status(200).json({ message: "User created" });
  } catch (error) {
    return res.status(502).json({ message: "E-mail Failure" });
  }
};

export const activateUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const activationToken = req.params.token;

  try {
    await activateUserByToken(activationToken);
    return res.send({ message: "Account has been activated" });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authenticatedUser = req.authorization;
  const { page, size } = req.paginations;
  try {
    const users = await getUsers(page, size, authenticatedUser);
    res.status(200).send(users);
  } catch (error) {
    next(new UnexpectedException());
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await findUserById(id);
    res.status(200).send(user);
  } catch (error) {
    next(new NotFoundException("User not found"));
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = <IDictionary>{};
    errors
      .array()
      .forEach((error) => (validationErrors[error.param] = error.msg));
    return res.status(400).json({
      validationErrors: validationErrors,
      message: "Validation Failure",
      path: req.originalUrl,
      timestamp: "",
    });
  }
  const user = req.authorization;
  try {
    if (!user || user.id.toString() !== req.params.id.toString()) {
      return next(
        new ForbiddenException("You are not authorize to update the user")
      );
    }
    const updatedUser = await updateUserById(req.params.id, req.body);

    return res.status(200).send(updatedUser);
  } catch (error) {
    next(new UnexpectedException());
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.authorization;
  if (!user) {
    return next(new AuthenticationException());
  }
  if (user.id.toString() !== req.params.id.toString()) {
    return next(new ForbiddenException());
  }
  try {
    const userinDB = await User.findOne({ where: { id: user.id } });
    if (userinDB.image) {
      await FileService.deleteProfileImage(userinDB.image);
    }
    await deleteUserById(user.id);
    res.send();
  } catch (error) {
    next(new UnexpectedException());
  }
};
