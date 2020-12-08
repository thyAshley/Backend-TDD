import { Request, Response, NextFunction } from "express";

export const validateUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.body;
  if (username === null) {
    req.validationErrors = {
      ...req.validationErrors,
      username: "Username cannot be null",
    };
  }
  next();
};

export const validateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  if (email === null) {
    req.validationErrors = {
      ...req.validationErrors,
      email: "Email cannot be null",
    };
  }
  next();
};
