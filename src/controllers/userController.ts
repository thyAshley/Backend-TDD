import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../model/User";

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
    return res.status(400).json({ validationErrors: validationErrors });
  }

  const { username, email, password } = req.body;
  try {
    const encPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: encPassword,
    });
    return res.status(200).json({ message: "User created" });
  } catch (error) {
    return res.status(400).json(error);
  }
};
