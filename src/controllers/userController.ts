import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../model/User";

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const encPassword = await bcrypt.hash(password, 10);
  await User.create({
    username,
    email,
    password: encPassword,
  });
  return res.status(200).json({ message: "User created" });
};
