import fs from "fs";
import path from "path";
import config from "config";
const uploadDir: string = config.get("uploadDir");
const profileDir: string = config.get("profileDir");
const ProfileDirectory = path.join(".", uploadDir, profileDir);

export const cleanup = () => {
  const files = fs.readdirSync(ProfileDirectory);
  for (const file of files) {
    fs.unlinkSync(path.join(ProfileDirectory, file));
  }
};

cleanup();
