import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

import {
  NotFoundException,
  AuthenticationException,
  ForbiddenException,
  ValidationException,
  UnexpectedException,
} from "../utils/errorUtils";
import User from "../model/User";
import * as TokenService from "../utils/TokenService";
import { ValidationError } from "sequelize/types";
import { findByEmail } from "../utils/userUtils";

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
    const token = await TokenService.createToken(user);

    return res.status(200).json({
      id: user.id,
      username: user.username,
      token,
    });
  } catch (error) {
    res.status(400).send("error");
  }
};

export const logUserOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.split(" ")[1];
    await TokenService.deleteToken(token);
  }
  res.send();
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationException("Invalid Email Format"));
  }
  const { email } = req.body;
  try {
    const user = await findByEmail(email);
    if (!user) {
      return next(new NotFoundException("Email not found"));
    }
    res.status(200).send();
  } catch (error) {
    return next(new UnexpectedException());
  }
};
