import fs from "fs";
import path from "path";
import FileType from "file-type";
import config from "config";

import { randomString } from "./generator";
import { UnexpectedException } from "./errorUtils";
import FileAttachment from "../model/FileAttachment";
import { save } from "./HoaxServices";

const uploadDir: string = config.get("uploadDir");
const profileDir: string = config.get("profileDir");
const attachmentDir: string = config.get("attachmentDir");
const profileFolder = path.join(".", uploadDir, profileDir);
const attachmentFolder = path.join(".", uploadDir, attachmentDir);

export const createFolder = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  if (!fs.existsSync(profileFolder)) {
    fs.mkdirSync(profileFolder);
  }

  if (!fs.existsSync(attachmentFolder)) {
    fs.mkdirSync(attachmentFolder);
  }
};

export const saveProfileImage = async (encodedFile: string) => {
  const file = randomString(32);
  const filePath = path.join(".", profileFolder, file);
  await fs.promises.writeFile(filePath, encodedFile, "base64");
  return file;
};

export const deleteProfileImage = async (image: string) => {
  const filePath = path.join(".", profileFolder, image);
  await fs.promises.unlink(filePath);
};

export const saveAttachment = async (file: Express.Multer.File) => {
  const type = await FileType.fromBuffer(file.buffer);
  let filename = randomString(32);
  let fileType;
  if (type) {
    fileType = type.mime;
    filename += `.${type.ext}`;
  }

  fs.promises.writeFile(path.join(attachmentFolder, filename), file.buffer);
  const saveAttachment = await FileAttachment.create({
    filename: filename,
    uploadDate: new Date(),
    fileType: fileType,
  });
  return {
    id: saveAttachment.id,
  };
};

export const associateFileToHoax = async (
  attachmentId: string,
  hoaxId: string
) => {
  const attachment = await FileAttachment.findOne({
    where: { id: attachmentId },
  });
  if (!attachment) return;
  attachment.hoaxId = hoaxId;
  await attachment.save();
};
