import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../model/User";

export const registerUser = async (req: Request, res: Response) => {
  if (req.validationErrors) {
    return res
      .status(400)
      .json({ validationErrors: { ...req.validationErrors } });
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
