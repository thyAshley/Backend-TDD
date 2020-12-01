import User from "../model/User";

export const findByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (user) throw new Error("E-mail already exist");
};
