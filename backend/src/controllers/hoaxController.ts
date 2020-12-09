import { NextFunction, Request, Response } from "express";
import { AuthenticationException } from "../utils/errorUtils";

export const createHoax = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.authorization) {
    return next(
      new AuthenticationException("You are not authorize to update the user")
    );
  }
  return res.status(200).send();
};
