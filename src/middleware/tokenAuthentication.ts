import { Request, Response, NextFunction } from "express";
import * as TokenService from "../utils/TokenService";

export const tokenAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.split(" ")[1];
    const user = await TokenService.verifyToken(token);
    req.authorization = user;
  }
  next();
};
