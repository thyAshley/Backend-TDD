import User from "../model/User";
import { InvalidTokenException } from "../utils/errorUtils";

export const findByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (user) throw new Error("E-mail already exist");
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
