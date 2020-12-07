import fs from "fs";
import path from "path";
import config from "config";
import { randomString } from "./generator";

const uploadDir: string = config.get("uploadDir");
const profileDir: string = config.get("profileDir");
const profileFolder = path.join(".", uploadDir, profileDir);

export const createFolder = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  if (!fs.existsSync(profileFolder)) {
    fs.mkdirSync(profileFolder);
  }
};

export const saveProfileImage = async (encodedFile: string) => {
  const file = randomString(32);
  const filePath = path.join(".", profileFolder, file);
  await fs.promises.writeFile(filePath, encodedFile, "base64");
  return file;
};
