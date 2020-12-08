import * as FileService from "../../src/utils/FileService";
import fs from "fs";
import path from "path";
import config from "config";

describe("createFolders", () => {
  let uploadDir: string;
  let profileDir: string;
  beforeAll(() => {
    uploadDir = config.get("uploadDir");
    profileDir = config.get("profileDir");
  });
  it("creates upload folder", () => {
    FileService.createFolder();
    expect(fs.existsSync(uploadDir)).toBe(true);
  });
  it("creates profile folder under upload folder", () => {
    FileService.createFolder();
    const profileFolder = path.join(".", uploadDir, profileDir);
    expect(fs.existsSync(profileFolder)).toBe(true);
  });
});
