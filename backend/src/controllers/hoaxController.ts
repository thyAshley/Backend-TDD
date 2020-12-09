import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import * as HoaxServices from "../utils/HoaxServices";
import {
  AuthenticationException,
  UnexpectedException,
} from "../utils/errorUtils";

interface ErrorInterface {
  [key: string]: string;
}

export const getHoax = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { size, page } = req.paginations;

  const hoaxes = await HoaxServices.get(size, page);
  res.status(200).send({
    hoaxes: hoaxes.rows,
    page,
    size,
    totalPages: hoaxes.count / size,
  });
};

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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationError = <ErrorInterface>{};
    errors
      .array()
      .forEach((error) => (validationError[error.param] = error.msg));
    return res.status(400).send({
      validationErrors: validationError,
      message: "Validation Failure",
      path: req.originalUrl,
      timestamp: Date.now(),
    });
  }
  try {
    await HoaxServices.save(req.body, req.authorization.id);
    return res.status(200).send({ message: "Hoax is saved" });
  } catch (error) {
    console.log(error);
    return next(new UnexpectedException());
  }
};
