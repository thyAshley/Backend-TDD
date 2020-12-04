import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";

import {
  AuthenticationException,
  ForbiddenException,
} from "../utils/errorUtils";
import User from "../model/User";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(new AuthenticationException());
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return next(new AuthenticationException());
    }
    if (user.active === false) {
      return next(new ForbiddenException());
    }
    return res.status(200).json({
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    res.status(400).send("error");
  }
};
