import fs from "fs";
import path from "path";
import config from "config";
const uploadDir: string = config.get("uploadDir");
const profileDir: string = config.get("profileDir");
const attachmentDir: string = config.get("attachmentDir");
const ProfileDirectory = path.join(".", uploadDir, profileDir);
const AttachmentDirectory = path.join(".", uploadDir, attachmentDir);

export const clearFolder = (folder: string) => {
  const files = fs.readdirSync(folder);
  for (const file of files) {
    fs.unlinkSync(path.join(folder, file));
  }
};

export const cleanup = () => {
  clearFolder(ProfileDirectory);
  clearFolder(AttachmentDirectory);
};
cleanup();
