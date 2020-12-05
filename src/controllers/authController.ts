import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

import {
  AuthenticationException,
  ForbiddenException,
} from "../utils/errorUtils";
import User from "../model/User";
import * as TokenService from "../utils/TokenService";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AuthenticationException());
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(new AuthenticationException());
    }
    if (!user.active) {
      return next(new ForbiddenException());
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return next(new AuthenticationException());
    }
    const token = TokenService.createToken(user);

    return res.status(200).json({
      id: user.id,
      username: user.username,
      token,
    });
  } catch (error) {
    res.status(400).send("error");
  }
};
