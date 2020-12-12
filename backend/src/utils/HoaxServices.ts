import User from "../model/User";
import Hoax from "../model/Hoax";
import { NotFoundException } from "./errorUtils";
import * as FileService from "./FileService";

export const save = async (
  body: { content: string; fileAttachment?: string },
  id: string
) => {
  const hoax = await Hoax.create({
    ...body,
    timestamp: Date.now(),
    userId: id,
  });
  const { id: hoaxId } = hoax;
  if (body.fileAttachment) {
    await FileService.associateFileToHoax(
      body.fileAttachment,
      hoaxId.toString()
    );
  }
};

export const get = async (limit: number = 10, page: number = 0) => {
  return await Hoax.findAndCountAll({
    limit: limit,
    offset: page * limit,
    attributes: ["id", "content", "timestamp"],
    order: [["id", "DESC"]],
    include: {
      model: User,
      as: "user",
      attributes: ["id", "username", "email", "image"],
    },
  });
};

export const getHoaxesOfUser = async (
  id: string,
  page: number,
  limit: number
) => {
  const user = await User.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException("User does not exist");
  }
  return Hoax.findAndCountAll({
    where: { userId: id },
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
