import request from "supertest";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import config from "config";

import { sequelize } from "../src/db/database";
import app from "../src/app";
import User from "../src/model/User";
import Token from "../src/model/Token";

const validUser = {
  username: "user1",
  email: "user1@test.com",
  password: "P4ssword",
  active: true,
};

const uploadDir: string = config.get("uploadDir");
const profileDir: string = config.get("profileDir");
const profilePath = path.join(".", uploadDir, profileDir);

const addUser = async (user = validUser) => {
  return await User.create({
    ...user,
    password: await bcrypt.hash("P4ssword", 10),
  });
};

const readFileAsBase64 = () => {
  const filePath = path.join(__dirname, "resources", "test-png.png");
  return fs.readFileSync(filePath, { encoding: "base64" });
};

const addImageToUser = async () => {
  const fileInBase64 = readFileAsBase64();
  const user = await addUser();
  await User.findOne({ where: { username: validUser.username } });
  const tokenResponse = await request(app)
    .post(`/api/v1/auth`)
    .send({ email: validUser.email, password: validUser.password });

  const token = tokenResponse.body.token;
  await request(app)
    .put(`/api/v1/users/${user.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ image: fileInBase64 });
  return token;
};

const auth = async (
  email: string = validUser.email,
  password: string = validUser.password
) => {
  return await request(app).post("/api/v1/auth").send({ email, password });
};

const deleteUser = async (id: string | number = 5, token?: string) => {
  const agent = request(app).delete(`/api/v1/users/${id}`);
  if (token) {
    agent.set("Authorization", `Bearer ${token}`);
  }

  return agent.send();
};

beforeAll(async () => {
  await sequelize.sync();
});

describe("When deleting user without authorization", () => {
  let response: request.Response;
  beforeAll(async () => {
    response = await deleteUser(5);
  });
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it("returns unauthorized status 401", () => {
    expect(response.status).toBe(401);
  });
  it("returns unauthorize message", () => {
    expect(response.body.message).toContain("Invalid");
    expect(response.body.path).toBe("/api/v1/users/5");
    expect(response.body.timestamp).toBeTruthy();
    expect(response.body.name).toBe("AuthenticationException");
  });
});

describe("when deleting user with valid credentials but for wrong user", () => {
  beforeAll(async () => {
    await addUser();
  });
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it("returns unauthorize", async () => {
    const toDeleteUser = await addUser({
      ...validUser,
      username: "user2",
      email: "user2@test.com",
    });
    const authResponse = await auth();
    const response = await deleteUser(toDeleteUser.id, authResponse.body.token);
    expect(response.status).toBe(403);
    expect(response.body.message).toContain("not authorize");
    expect(response.body.path).toBe(`/api/v1/users/${toDeleteUser.id}`);
    expect(response.body.timestamp).toBeTruthy();
    expect(response.body.name).toBe("ForbiddenException");
  });
});

describe("when deleting user with invalid token", () => {
  let requestUser: User;
  beforeAll(async () => {
    requestUser = await addUser();
  });
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it("returns unauthorize 401", async () => {
    const response = await deleteUser(requestUser.id, "invalid");
    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Invalid");
    expect(response.body.path).toBe(`/api/v1/users/${requestUser.id}`);
    expect(response.body.timestamp).toBeTruthy();
    expect(response.body.name).toBe("AuthenticationException");
  });
});

describe("when deleting user with valid token and valid user", () => {
  let requestUser: User;
  let response: request.Response;
  let token;
  beforeAll(async () => {
    requestUser = await addUser();
    const authResponse = await auth();
    token = authResponse.body.token;
    response = await deleteUser(requestUser.id, token);
  });
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it("returns unauthorize 401", async () => {
    expect(response.status).toBe(200);
  });
  it("remove user from database", async () => {
    const dbUser = await User.findOne({ where: { id: requestUser.id } });
    expect(dbUser).toBe(null);
  });
  it("delete token from database", async () => {
    const dbToken = await Token.findOne({ where: { token: token } });
    expect(dbToken).toBeNull();
  });
  it("delete all token from database", async () => {
    requestUser = await addUser();
    const tokenOne = await auth();
    await auth();
    let dbToken = await Token.findAll();
    expect(dbToken).toHaveLength(2);

    response = await deleteUser(requestUser.id, tokenOne.body.token);
    dbToken = await Token.findAll();
    expect(dbToken).toHaveLength(0);
  });
});

describe("when deleting user from database", () => {
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });
  it("should delete user image from folder", async () => {
    const token = await addImageToUser();
    const user = await User.findOne({ where: { email: validUser.email } });
    await deleteUser(user.id, token);
    expect(fs.existsSync(path.join(profilePath, user.image))).toBeFalsy();
  });
});
