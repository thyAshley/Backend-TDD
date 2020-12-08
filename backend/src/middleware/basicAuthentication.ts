import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../model/User";

export const basicAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const encoded = authorization.split(" ")[1];
    const decoded = Buffer.from(encoded, "base64").toString("ascii");
    const [email, password] = decoded.split(":");
    const user = await User.findOne({ where: { email: email } });
    if (user && user.active) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.authorization = user;
      }
    }
  }
  next();
};
