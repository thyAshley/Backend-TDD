import fs from "fs";
import path from "path";
import config from "config";
import { randomString } from "./generator";
import { UnexpectedException } from "./errorUtils";
import FileAttachment from "../model/FileAttachment";

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
  const filename = randomString(32);
  fs.promises.writeFile(path.join(attachmentFolder, filename), file.buffer);
  await FileAttachment.create({
    filename: filename,
    uploadDate: new Date(),
  });
};
