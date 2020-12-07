import Sequelize from "sequelize";
import bcrypt from "bcryptjs";

import User from "../model/User";
import {
  InvalidTokenException,
  EmailException,
  NotFoundException,
  ForbiddenException,
  InactiveAccountException,
} from "../utils/errorUtils";
import * as TokenService from "./TokenService";
import * as EmailService from "../email/EmailService";
import { randomString } from "./generator";

export const findByEmail = async (email: string) => {
  return User.findOne({ where: { email: email } });
};

export const findExistingEmail = async (email: string) => {
  const user = await findByEmail(email);
  if (user) throw new EmailException();
};

export const activateUserByToken = async (token: string) => {
  const user = await User.findOne({ where: { activationToken: token } });
  if (!user) {
    throw new InvalidTokenException();
  }
  user.active = true;
  user.activationToken = null;
  await user.save();
};

export const getUsers = async (
  page: number,
  pageSize: number,
  authenticatedUser: User
) => {
  if (typeof page !== "number") page = parseInt(page);
  if (typeof pageSize !== "number") pageSize = parseInt(pageSize);
  let uid = "0";
  if (authenticatedUser) {
    uid = authenticatedUser.id;
  }

  const usersWithCount = await User.findAndCountAll({
    where: {
      active: true,
      id: { [Sequelize.Op.not]: uid },
    },
    limit: pageSize,
    offset: page * pageSize,
    attributes: ["id", "username", "email", "image"],
  });
  return {
    content: usersWithCount.rows,
    page: page,
    size: pageSize,
    totalPages: Math.ceil(usersWithCount.count / pageSize),
  };
};

export const findUserById = async (id: string) => {
  const user = await User.findOne({
    where: { id: id, active: true },
    attributes: ["id", "username", "email", "image"],
  });
  if (!user) throw new NotFoundException("User not found");
  return user;
};

export const updateUserById = async (
  id: string,
  fields: { username: string; image: string }
) => {
  const user = await User.findOne({ where: { id: id } });
  user.username = fields.username || user.username;
  user.image = fields.image || user.image;
  await user.save();
  return {
    id,
    username: user.username,
    email: user.email,
    image: user.image,
  };
};

export const deleteUserById = async (id: string) => {
  await User.destroy({ where: { id: id } });
};

export const generateToken = () => {
  return randomString(16);
};

export const findByPasswordResetToken = (token: string) => {
  return User.findOne({ where: { passwordResetToken: token } });
};
export const updatePassword = async (token: string, password: string) => {
  const user = await findByPasswordResetToken(token);
  if (!user) {
    throw new ForbiddenException(
      "You are not authorized to perform this action, you may have provided an incorrect key"
    );
  }
  const hash = await bcrypt.hash(password, 10);
  user.password = hash;
  user.passwordResetToken = null;
  await user.save();
  await TokenService.deleteAllUserToken(user.id);
};

export const passwordResetRequest = async (email: string) => {
  const user = await findByEmail(email);
  if (!user) {
    throw new NotFoundException("Email not found");
  }
  if (!user.active) {
    throw new InactiveAccountException(
      "Account is not activated, please activate your account first"
    );
  }

  user.passwordResetToken = randomString(8);
  try {
    await user.save();
    await EmailService.sendPasswordResetMail(email, user.passwordResetToken);
  } catch (error) {
    throw new EmailException();
  }
};
