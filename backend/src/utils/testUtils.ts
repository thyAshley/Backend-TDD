import bcrypt from "bcryptjs";
import User from "../model/User";

export const createUsers = async (
  activeCount: number,
  inactiveCount: number = 0
) => {
  const hash = await bcrypt.hash("P4ssword", 10);
  for (let i = 0; i < activeCount + inactiveCount; i++) {
    User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@mail.com`,
      password: hash,
      active: i < activeCount,
    });
  }
};
