import request from "supertest";
import path from "path";
import fs from "fs";
import config from "config";

import app from "../src/app";
import FileAttachment from "../src/model/FileAttachment";
import { sequelize } from "../src/db/database";

const { uploadDir, attachmentDir }: any = config;

beforeAll(async () => {
  if (process.env.NODE_ENV === "test") {
    await sequelize.sync();
  }
});

beforeEach(async () => {
  await FileAttachment.destroy({ truncate: true });
});

describe("Upload file for Hoax", () => {
  const uploadFile = (file = "test-png.png") => {
    return request(app)
      .post("/api/v1/hoaxes/attachments")
      .attach("file", path.join(__dirname, "resources", file))
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
  it.each`
    file              | fileType
    ${"test-txt.txt"} | ${null}
    ${"test-png.png"} | ${"image/png"}
    ${"test-png"}     | ${"image/png"}
    ${"test-jpg.jpg"} | ${"image/jpeg"}
    ${"test-gif.gif"} | ${"image/gif"}
  `("saves $fileType when $file is uploaded", async ({ file, fileType }) => {
    await uploadFile(file);
    const attachments = await FileAttachment.findAll();
    expect(attachments[0].fileType).toBe(fileType);
  });
  it.each`
    file              | extension
    ${"test-txt.txt"} | ${null}
    ${"test-png.png"} | ${"png"}
    ${"test-png"}     | ${"png"}
    ${"test-jpg.jpg"} | ${"jpeg"}
    ${"test-gif.gif"} | ${"gif"}
  `(
    "saves $file with $extension when uploaded",
    async ({ file, extension }) => {
      await uploadFile(file);
      const attachments = await FileAttachment.findAll();
      if (file === "test-txt.txt") {
        expect(attachments[0].filename.endsWith("txt")).toBe(false);
      } else {
        expect(attachments[0].fileType.endsWith(extension)).toBe(true);
      }
      const filePath = path.join(
        ".",
        uploadDir,
        attachmentDir,
        attachments[0].filename
      );
      expect(fs.existsSync(filePath)).toBe(true);
    }
  );
  it("returns 400 when uploaded file size is bigger than 5MB", async () => {
    const response = await uploadFile("5mbfile");
    expect(response.status).toBe(400);
  });
  it("returns 400 when uploaded file size is bigger than 5MB", async () => {
    const response = await uploadFile("5mbfile");
    expect(response.body.message).toBe("File cannot be bigger than 5MB");
  });
});
