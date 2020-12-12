import request from "supertest";
import fs from "fs";
import path from "path";
import config from "config";

import app from "../src/app";

const uploadDir: string = config.get("uploadDir");
const attachmentDir: string = config.get("attachmentDir");
const profileDir: string = config.get("profileDir");
const profileFolder = path.join(".", uploadDir, profileDir);
const attachmentFolder = path.join(".", uploadDir, attachmentDir);
const filePath = path.join(".", "test", "resources", "test-png.png");

describe("Hoax Attachment", () => {
  const copyFile = () => {
    const storedFileName = "test-file.png";
    const targetPath = path.join(attachmentFolder, storedFileName);
    fs.copyFileSync(filePath, targetPath);
    return storedFileName;
  };
  describe("when file does not exist", () => {
    let response: request.Response;
    beforeAll(async () => {
      response = await request(app).get("/attachments/123456");
    });
    it("returns status code 404", () => {
      expect(response.status).toBe(404);
    });
  });
  describe("when file exist", () => {
    it("returns status code 200", async () => {
      const storedFileName = copyFile();
      const response = await request(app).get(`/attachments/${storedFileName}`);
      expect(response.status).toBe(200);
    });
    it("returns cache for 1 year in response", async () => {
      const storedFileName = copyFile();
      const response = await request(app).get(`/attachments/${storedFileName}`);
      const oneYear = 365 * 24 * 60 * 60;
      expect(response.header["cache-control"]).toContain(`max-age=${oneYear}`);
    });
  });
});

describe("Profile Images", () => {
  const copyFile = () => {
    const storedFileName = "test-file.png";
    const targetPath = path.join(profileFolder, storedFileName);
    fs.copyFileSync(filePath, targetPath);
    return storedFileName;
  };
  describe("when file does not exist", () => {
    let response: request.Response;
    beforeAll(async () => {
      response = await request(app).get("/images/123456");
    });
    it("returns status code 404", () => {
      expect(response.status).toBe(404);
    });
  });
  describe("when file exist", () => {
    it("returns status code 200", async () => {
      const storedFileName = copyFile();
      const response = await request(app).get(`/images/${storedFileName}`);
      expect(response.status).toBe(200);
    });
    it("returns cache for 1 year in response", async () => {
      const storedFileName = copyFile();
      const response = await request(app).get(`/images/${storedFileName}`);
      const oneYear = 365 * 24 * 60 * 60;
      expect(response.header["cache-control"]).toContain(`max-age=${oneYear}`);
    });
  });
});
