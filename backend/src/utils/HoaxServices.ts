import Hoax from "../model/Hoax";

export const save = async (body: { content: string }, id: string) => {
  await Hoax.create({
    ...body,
    timestamp: Date.now(),
    userId: id,
  });
};
