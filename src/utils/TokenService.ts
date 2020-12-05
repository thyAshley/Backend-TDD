import jwt from "jsonwebtoken";
import User from "../model/User";

const secretKey = "temporarysecretkeytobereplacedwith .env";
export const createToken = (user: User) => {
  return jwt.sign(
    {
      id: user.id,
      active: user.active,
      email: user.email,
      username: user.username,
    },
    secretKey
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, secretKey);
};
