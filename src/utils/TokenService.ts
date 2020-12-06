import Sequelize from "sequelize";

import { randomString } from "../utils/generator";
import Token from "../model/Token";
import User from "../model/User";

export const createToken = async (user: User) => {
  const token = randomString(32);
  await Token.create({
    token,
    userId: user.id,
    lastUsedAt: new Date(),
  });
  return token;
};

export const verifyToken = async (token: string) => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const storedToken = await Token.findOne({
    where: {
      token: token,
      lastUsedAt: {
        [Sequelize.Op.gt]: oneWeekAgo,
      },
    },
  });
  if (storedToken) {
    storedToken.lastUsedAt = new Date();
    await storedToken.save();
  }
  const userId = storedToken.userId;
  return { id: userId };
};

export const deleteToken = async (token: string) => {
  await Token.destroy({ where: { token: token } });
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
