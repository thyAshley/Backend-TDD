import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { sendAccountActivation } from "../email/EmailService";
import User from "../model/User";
import { activateUserByToken, getUsers } from "../utils/userUtils";

interface IDictionary {
  [key: string]: string;
}

const generateToken = () => {
  return crypto.randomBytes(16).toString("hex").substring(0, 16);
};

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
    res.status(400);
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  const page = req.query.page || 0;
  const users = await getUsers(+page);
  res.status(200).send(users);
};
