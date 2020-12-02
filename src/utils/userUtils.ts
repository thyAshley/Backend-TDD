import User from "../model/User";

function InvalidTokenException() {
  this.message = "invalid token";
}
export const findByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (user) throw new Error("E-mail already exist");
};

export const activateUserByToken = async (token: string) => {
  const user = await User.findOne({ where: { activationToken: token } });
  if (!user) {
    console.log("no user");
    throw new Error("Invalid token sent, Account Activation Failed");
  }
  user.active = true;
  user.activationToken = null;
  await user.save();
  return;
};
