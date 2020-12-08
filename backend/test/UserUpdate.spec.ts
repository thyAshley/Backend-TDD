import request from "supertest";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import config from "config";

import User from "../src/model/User";
import { sequelize } from "../src/db/database";
import * as TestCleanup from "../src/utils/testCleanup";
import app from "../src/app";

const uploadDir: string = config.get("uploadDir");
const profileDir: string = config.get("profileDir");
const ProfileDirectory = path.join(".", uploadDir, profileDir);

const validUser = {
  username: "user1",
  email: "user1@test.com",
  active: true,
};

const readFileAsBase64 = (file = "test-jpg.jpg") => {
  const filePath = path.join(__dirname, "resources", file);
  return fs.readFileSync(filePath, { encoding: "base64" });
};

const createUser = async (user = validUser) => {
  return await User.create({
    ...user,
    password: await bcrypt.hash("P4ssword", 10),
  });
};
beforeAll(async () => {
  await sequelize.sync();
  TestCleanup.cleanup();
});

const updateUser = async (
  id: string | number = 5,
  options?: { auth: { email?: string; password?: string; token?: string } },
  body?: {}
) => {
  let tokenAgent = request(app).post("/api/v1/auth");
  let updateAgent = request(app).put(`/api/v1/users/${id}`);
  let token;
  if (options && options.auth) {
    const response = await tokenAgent.send(options.auth);
    token = response.body.token;
  }
  if (token) {
    updateAgent.set("Authorization", `Bearer ${token}`);
  }
  if (options?.auth?.token) {
    updateAgent.set("Authorization", `Bearer ${options.auth.token}`);
  }

  return updateAgent.send(body);
};

describe("When updating user without authorization", () => {
  let response: request.Response;
  beforeAll(async () => {
    response = await updateUser();
  });

  it("return status code 403 forbidden", async () => {
    expect(response.status).toBe(403);
  });
  it("return unauthorize message", async () => {
    expect(response.body.message).toBe(
      "You are not authorize to update the user"
    );
    expect(response.body.path).toBe("/api/v1/users/5");
    expect(response.body.timestamp).toBeLessThanOrEqual(new Date().getTime());
  });
});

describe("When invalid auth and inactive users sends an update request", () => {
  let user: User;
  beforeAll(async () => {
    user = await createUser();
  });
  afterAll(async () => {
    User.destroy({ truncate: true, cascade: true });
  });
  it("return status code 403 forbidden when email is invalid", async () => {
    const response = await updateUser(user.id, {
      auth: { email: "user1000@test.com", password: "P4ssword" },
    });
    expect(response.status).toBe(403);
  });
  it("return status code 403 forbidden when password is invalid", async () => {
    const response = await updateUser(user.id, {
      auth: { email: "user1@test.com", password: "invalid" },
    });
    expect(response.status).toBe(403);
  });
  it("return status code 403 when credential is correct but for wrong user", async () => {
    const userToBeUpdated = await createUser({
      ...validUser,
      email: "user2@test.com",
      username: "user2",
    });
    const response = await updateUser(userToBeUpdated.id, {
      auth: { email: "user1@test.com", password: "P4ssword" },
    });
    expect(response.status).toBe(403);
  });
  it("return status code 403 when credential is correct but for inactive user", async () => {
    const userToBeUpdated = await createUser({
      ...validUser,
      email: "user3@test.com",
      username: "user3",
      active: false,
    });
    const response = await updateUser(userToBeUpdated.id, {
      auth: { email: "user1@test.com", password: "P4ssword" },
    });
    expect(response.status).toBe(403);
  });
});

describe("When valid auth and active users send an update request", () => {
  let update = { username: "user1-update" };
  let user: User;
  let response: request.Response;
  beforeAll(async () => {
    user = await createUser();
    response = await updateUser(
      user.id,
      { auth: { email: validUser.email, password: "P4ssword" } },
      update
    );
  });
  afterAll(async () => {
    User.destroy({ truncate: true, cascade: true });
  });
  it("returns status code 200", () => {
    expect(response.status).toBe(200);
  });
  it("update username to new user", async () => {
    const updatedUser = await User.findOne({ where: { id: user.id } });
    expect(updatedUser.username).toBe(update.username);
  });
  it("returns 403 when invalid token is sent", async () => {
    const response = await updateUser(5, { auth: { token: "token" } }, null);
    expect(response.status).toBe(403);
  });
});

describe("When user update their image", () => {
  let inDbUser: User;
  let response: request.Response;
  beforeAll(async () => {
    const fileInBase64 = readFileAsBase64();
    const saveUser = await createUser();
    const validUpdate = { username: "user1-update", image: fileInBase64 };
    response = await updateUser(
      saveUser.id,
      { auth: { email: validUser.email, password: "P4ssword" } },
      validUpdate
    );
    inDbUser = await User.findOne({ where: { id: saveUser.id } });
  });
  afterAll(async () => {
    User.destroy({ truncate: true, cascade: true });
  });
  it("save the user image as base64", async () => {
    expect(inDbUser.image).toBeTruthy();
  });

  it("returns success body", () => {
    expect(response.status).toBe(200);
    expect(Object.keys(response.body)).toEqual([
      "id",
      "username",
      "email",
      "image",
    ]);
  });
});

describe("When user update their image", () => {
  let inDbUser: User;
  let response: request.Response;
  let profileImagePath: string;
  beforeAll(async () => {
    const fileInBase64 = readFileAsBase64();
    const saveUser = await createUser();
    const validUpdate = { username: "user1-update", image: fileInBase64 };
    response = await updateUser(
      saveUser.id,
      { auth: { email: validUser.email, password: "P4ssword" } },
      validUpdate
    );
    inDbUser = await User.findOne({ where: { id: saveUser.id } });
    profileImagePath = path.join(ProfileDirectory, inDbUser.image);
  });
  afterAll(async () => {
    User.destroy({ truncate: true, cascade: true });
  });
  it("save the user image as base64", () => {
    expect(fs.existsSync(profileImagePath)).toBeTruthy();
  });
});

describe("when user upload a new image", () => {
  afterAll(async () => {
    User.destroy({ truncate: true, cascade: true });
  });
  it("remove the old image", async () => {
    const fileInBase64 = readFileAsBase64();
    const saveUser = await createUser();
    const validUpdate = { image: fileInBase64, username: "user1" };
    const response = await updateUser(
      saveUser.id,
      { auth: { email: validUser.email, password: "P4ssword" } },
      validUpdate
    );
    const firstImage = response.body.image;
    await updateUser(
      saveUser.id,
      { auth: { email: validUser.email, password: "P4ssword" } },
      validUpdate
    );
    const profileImagePath = path.join(ProfileDirectory, firstImage);
    expect(fs.existsSync(profileImagePath)).toBe(false);
  });
});

describe("validation check for username updating", () => {
  let user: User;
  beforeAll(async () => {
    user = await createUser();
  });
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it.each`
    value             | message
    ${null}           | ${"Username cannot be null"}
    ${"adm"}          | ${"Username must be between 4 and 32 characters"}
    ${"a".repeat(33)} | ${"Username must be between 4 and 32 characters"}
  `(
    "returns $message when username is $value",
    async ({ value, message }: { value: string; message: string }) => {
      const validUpdate = { username: value };
      const response = await updateUser(
        user.id,
        { auth: { email: validUser.email, password: "P4ssword" } },
        validUpdate
      );

      expect(response.status).toBe(400);
      expect(response.body.validationErrors.username).toBe(message);
    }
  );
});

describe("When uploading image which is exactly 2mb", () => {
  const testPng = readFileAsBase64();
  const pngByte = Buffer.from(testPng, "base64").length;
  const twoMB = 1024 * 1024 * 2;
  const fileWith2MB = "a".repeat(twoMB - pngByte);
  const base64 = Buffer.from(fileWith2MB).toString("base64");
  const validUpdate = { username: "user1", image: testPng + base64 };
  console.log(base64.length);
  let user: User;
  beforeAll(async () => {
    user = await createUser();
  });
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it("returns 200 ok", async () => {
    const response = await updateUser(
      user.id,
      { auth: { email: user.email, password: "P4ssword" } },
      validUpdate
    );
    expect(response.status).toBe(200);
  });
});

describe("When uploading image which is exceeds 2mb", () => {
  let response: request.Response;
  let user: User;
  beforeAll(async () => {
    user = await createUser();
    const testPng = readFileAsBase64();
    const twoMB = 1024 * 1024 * 2;
    const fileWith2MB = "a".repeat(twoMB);
    const base64image = Buffer.from(fileWith2MB).toString("base64");
    const validBody = { username: "user1", image: testPng + base64image };
    response = await updateUser(
      user.id,
      { auth: { email: user.email, password: "P4ssword" } },
      validBody
    );
  });
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it.skip("returns 400 error", () => {
    expect(response.status).toBe(400);
  });
  it.skip("returns error message", () => {
    console.log(response.body);
    expect(response.body.validationErrors.image).toBe(
      "Your profile image cannot be bigger than 2MB"
    );
  });
});

describe("keeps existing image if user only update username", () => {
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it("save the user image as base64", async () => {
    const fileInBase64 = readFileAsBase64();
    const saveUser = await createUser();
    const validUpdate = { username: "user1-update", image: fileInBase64 };
    const firstUpdate = await updateUser(
      saveUser.id,
      { auth: { email: validUser.email, password: "P4ssword" } },
      validUpdate
    );
    const firstImage = firstUpdate.body.image;
    await updateUser(
      saveUser.id,
      { auth: { email: validUser.email, password: "P4ssword" } },
      { username: "user1-update 1" }
    );
    const inDbUser = await User.findOne({ where: { id: saveUser.id } });
    const profileImagePath = path.join(ProfileDirectory, inDbUser.image);
    expect(fs.existsSync(profileImagePath)).toBe(true);
    expect(inDbUser.image).toBe(firstImage);
  });
});

describe("test filetype", () => {
  beforeEach(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it.each`
    file              | message
    ${"test-gif.gif"} | ${"Only JPEG or PNG files are allowed"}
    ${"test-txt.txt"} | ${"Only JPEG or PNG files are allowed"}
  `(
    "returns $message when uploading $file as image",
    async ({ file, message }) => {
      const fileInBase64 = readFileAsBase64(file);
      const saveUser = await createUser();
      const updateBody = { username: "user1-update", image: fileInBase64 };
      const response = await updateUser(
        saveUser.id,
        { auth: { email: validUser.email, password: "P4ssword" } },
        updateBody
      );
      expect(response.body.validationErrors.image).toBe(message);
    }
  );
});
