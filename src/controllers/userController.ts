import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import { sendAccountActivation } from "../email/EmailService";
import User from "../model/User";
import * as TokenService from "../utils/TokenService";
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
  UnexpectedException,
  UserNotFoundException,
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
    next(new UserNotFoundException());
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.authorization;
  try {
    if (!user || user.id.toString() !== req.params.id.toString()) {
      return next(
        new ForbiddenException("You are not authorize to update the user")
      );
    }
    await updateUserById(req.params.id, req.body);
    return res.status(200).json({
      message: "User updated successfully",
    });
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
    await deleteUserById(user.id);
    res.send();
  } catch (error) {
    next(new UnexpectedException());
  }
};
