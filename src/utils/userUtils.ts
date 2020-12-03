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

export const getUsers = async (page: number, pageSize: number) => {
  if (page < 0) page = 0;

  if (pageSize > 10 || pageSize < 0) pageSize = 10;

  const usersWithCount = await User.findAndCountAll({
    where: { active: true },
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
