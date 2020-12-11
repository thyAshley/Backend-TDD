import request from "supertest";
import path from "path";
import fs from "fs";
import config from "config";

import app from "../src/app";
import FileAttachment from "../src/model/FileAttachment";
import { sequelize } from "../src/db/database";

const { uploadDir, attachmentDir } = config;

beforeAll(async () => {
  if (process.env.NODE_ENV === "test") {
    await sequelize.sync();
  }
});

beforeEach(async () => {
  await FileAttachment.destroy({ truncate: true });
});

describe("Upload file for Hoax", () => {
  const filePath = path.join(__dirname, "resources", "test-png.png");

  const uploadFile = () => {
    return request(app)
      .post("/api/v1/hoaxes/attachments")
      .attach("file", filePath)
      .set("Connection", "keep-alive");
  };
  it("returns 200 after successful upload", async () => {
    const response = await uploadFile();
    expect(response.status).toBe(200);
  });
  it("saves file to database", async () => {
    const beforeRequest = Date.now();
    await uploadFile();
    const attachments = await FileAttachment.findAll();
    expect(attachments[0].filename).not.toBe("test-png.png");
    expect(attachments[0].uploadDate.getTime()).toBeGreaterThan(beforeRequest);
  });
  it("saves file to attachment folder", async () => {
    const beforeRequest = Date.now();
    await uploadFile();
    const attachments = await FileAttachment.findAll();
    const filePath = path.join(
      ".",
      uploadDir,
      attachmentDir,
      attachments[0].filename
    );
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
