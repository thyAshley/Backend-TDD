import User from "../model/User";
import Hoax from "../model/Hoax";

export const save = async (body: { content: string }, id: string) => {
  await Hoax.create({
    ...body,
    timestamp: Date.now(),
    userId: id,
  });
};

export const get = async (limit: number = 10, page: number = 0) => {
  return await Hoax.findAndCountAll({
    limit: limit,
    offset: page * limit,
    attributes: ["id", "content", "timestamp"],
    include: {
      model: User,
      as: "user",
      attributes: ["id", "username", "email", "image"],
    },
  });
};
