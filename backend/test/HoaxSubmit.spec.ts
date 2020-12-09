import request from "supertest";
import bcrypt from "bcryptjs";

import app from "../src/app";
import { sequelize } from "../src/db/database";
import User from "../src/model/User";

const postHoax = async (
  body?: {},
  options?: { auth: { email?: string; password?: string } }
) => {
  let tokenAgent = request(app).post("/api/v1/auth");
  let token;

  if (options && options.auth) {
    const response = await tokenAgent.send(options.auth);
    token = response.body.token;
  }
  let hoaxAgent = request(app).post(`/api/v1/hoaxes`);
  if (token) {
    hoaxAgent.set("Authorization", `Bearer ${token}`);
  }
  return hoaxAgent.send(body);
};

const validUser = {
  username: "user1",
  email: "user1@mail.com",
  active: true,
};
const createUser = async () => {
  return await User.create({
    ...validUser,
    password: await bcrypt.hash("P4ssword", 10),
  });
};

beforeAll(async () => {
  await sequelize.sync();
});

beforeEach(async () => {
  await User.destroy({ truncate: true, cascade: true });
});

describe("When Posting hoax without authentication", () => {
  it("returns 401", async () => {
    const response = await postHoax();
    expect(response.status).toBe(401);
  });
  it("returns error message", async () => {
    const now = Date.now();
    const response = await postHoax();
    expect(response.body.message).toBe(
      "You are not authorize to update the user"
    );
    expect(response.body.path).toBe("/api/v1/hoaxes");
    expect(response.body.timestamp).toBeGreaterThan(now);
  });
});

describe("When Posting hoax with valid authentication", () => {
  it("returns 200", async () => {
    await createUser();
    const response = await postHoax(
      { content: "Hoax content" },
      {
        auth: { email: validUser.email, password: "P4ssword" },
      }
    );
    expect(response.status).toBe(200);
  });
});
