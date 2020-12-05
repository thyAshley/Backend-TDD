import { randomString } from "../utils/generator";
import Token from "../model/Token";
import User from "../model/User";

export const createToken = async (user: User) => {
  const token = randomString(32);
  await Token.create({ token, userId: user.id });
  return token;
};

export const verifyToken = async (token: string) => {
  const storedToken = await Token.findOne({ where: { token } });
  const userId = storedToken.userId;
  return { id: userId };
};

// import jwt from "jsonwebtoken";
//JWT
// const secretKey = "temporarysecretkeytobereplacedwith .env";

// export const createToken = (user: User) => {
//   return jwt.sign(
//     {
//       id: user.id,
//       active: user.active,
//       email: user.email,
//       username: user.username,
//     },
//     secretKey,
//     {
//       expiresIn: "2d",
//     }
//   );
// };

// export const verifyToken = (token: string) => {
//   return jwt.verify(token, secretKey);
// };
