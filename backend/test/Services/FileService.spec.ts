import * as FileService from "../../src/utils/FileService";
import fs from "fs";
import path from "path";
import config from "config";

describe("createFolders", () => {
  let uploadDir: string;
  let profileDir: string;
  let attachmentDir: string;
  beforeAll(() => {
    uploadDir = config.get("uploadDir");
    profileDir = config.get("profileDir");
    attachmentDir = config.get("attachmentDir");
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
  it("creates attachment folder under upload folder", () => {
    FileService.createFolder();
    const attachmentFolder = path.join(".", uploadDir, attachmentDir);
    expect(fs.existsSync(attachmentFolder)).toBe(true);
  });
});
