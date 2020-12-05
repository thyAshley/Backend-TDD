import request from "supertest";
import bcrypt from "bcryptjs";
import User from "../src/model/User";
import { sequelize } from "../src/db/database";
import app from "../src/app";

const validUser = {
  username: "user1",
  email: "user1@test.com",
  active: true,
};

const createUser = async (user = validUser) => {
  return await User.create({
    ...user,
    password: await bcrypt.hash("P4ssword", 10),
  });
};
beforeAll(async () => {
  await sequelize.sync();
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
    User.destroy({ truncate: true });
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
    User.destroy({ truncate: true });
  });
  it("returns status code 200", () => {
    expect(response.status).toBe(200);
  });
  it("update username to new user", async () => {
    const updatedUser = await User.findOne({ where: { id: user.id } });
    expect(updatedUser.username).toBe(update.username);
  });
  it("return succesful update message", () => {
    expect(response.body.message).toContain("successful");
  });
  it("returns 403 when invalid token is sent", async () => {
    const response = await updateUser(5, { auth: { token: "token" } }, null);
    expect(response.status).toBe(403);
  });
});
