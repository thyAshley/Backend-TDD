import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";

import {
  AuthenticationException,
  ForbiddenException,
  ValidationException,
  UnexpectedException,
} from "../utils/errorUtils";
import User from "../model/User";
import * as TokenService from "../utils/TokenService";
import { passwordResetRequest } from "../utils/userUtils";

interface IDictionary {
  [key: string]: string;
}

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
    await passwordResetRequest(email);

    res
      .status(200)
      .json({ message: "Check your e-mail for resetting your password" });
  } catch (error) {
    if (error.status === 404) {
      return next(error);
    }
    if (error.status === 502) {
      return next(error);
    }
    next(new UnexpectedException());
  }
};

export const changePasswordWithToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  const { token } = req.body;
  try {
    const user = await User.findOne({ where: { passwordResetToken: token } });
    if (!user) {
      next(
        new ForbiddenException(
          "You are not authorized to perform this action, you may have provided an incorrect key"
        )
      );
    }

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
  } catch (error) {
    next(new UnexpectedException());
  }
};
