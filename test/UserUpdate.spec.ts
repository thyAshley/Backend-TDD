import request from "supertest";

import User from "../src/model/User";
import { sequelize } from "../src/db/database";
import app from "../src/app";

const validUser = {
  username: "user1",
  email: "user1@test.com",
  password: "P4ssword",
  active: true,
};

beforeAll(async () => {
  await sequelize.sync();
});

const updateUser = async (
  id: string | number = 5,
  options?: { auth: { email: string; password: string } }
) => {
  const agent = request(app).put(`/api/v1/users/${id}`);
  if (options?.auth) {
    const { email, password } = options.auth;
    agent.auth(email, password);
  }
  return agent.send();
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

describe("invalid login auth", () => {
  beforeAll(async () => {
    await User.create({ ...validUser });
  });
  afterAll(async () => {
    User.destroy({ truncate: true });
  });
  it("return status code 403 forbidden when email is invalid", async () => {
    const response = await updateUser(5, {
      auth: { email: "user1000@test.com", password: "P4ssword" },
    });
    expect(response.status).toBe(403);
  });
  it("return status code 403 forbidden when password is invalid", async () => {
    const response = await updateUser(5, {
      auth: { email: "user1@test.com", password: "P24ssword" },
    });
    expect(response.status).toBe(403);
  });
  it("return status code 403 when credential is correct but for wrong user", async () => {
    const userToBeUpdated = await User.create({
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
    const userToBeUpdated = await User.create({
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
