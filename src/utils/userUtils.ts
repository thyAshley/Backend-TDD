import User from "../model/User";
import { InvalidTokenException, EmailException } from "../utils/errorUtils";

export const findByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
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

export const getUsers = async () => {
  const users = await User.findAll({ where: { active: true }, limit: 10 });
  return {
    content: users,
    page: 0,
    size: 10,
    totalPages: 0,
  };
};
