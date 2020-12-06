import User from "../model/User";
import {
  InvalidTokenException,
  EmailException,
  NotFoundException,
} from "../utils/errorUtils";
import Sequelize from "sequelize";
import { randomString } from "./generator";

export const findByEmail = async (email: string) => {
  return User.findOne({ where: { email } });
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
    attributes: ["id", "username", "email"],
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
    attributes: ["id", "username", "email"],
  });
  if (!user) throw new NotFoundException("User not found");
  return user;
};

export const updateUserById = async (
  id: string,
  fields: { username: string }
) => {
  const user = await User.findOne({ where: { id: id } });
  user.username = fields.username || user.username;
  await user.save();
};

export const deleteUserById = async (id: string) => {
  await User.destroy({ where: { id: id } });
};

export const generateToken = () => {
  return randomString(16);
};
