import request from "supertest";
import bcrypt from "bcryptjs";

import User from "../src/model/User";
import Token from "../src/model/Token";
import { sequelize } from "../src/db/database";
import app from "../src/app";

beforeAll(async () => {
  await sequelize.sync();
});

const validUser = {
  username: "testuser",
  email: "testuser@test.com",
  password: "P4ssword",
  active: true,
};

const inactiveUser = {
  username: "testuser",
  email: "testuser@test.com",
  password: "P4ssword",
  active: false,
};

const postLogout = (token?: string) => {
  const agent = request(app).post("/api/v1/auth/logout");
  if (token) {
    agent.set("Authorization", `Bearer ${token}`);
  }
  return agent;
};

const createUser = async (user = validUser) => {
  return await User.create({
    ...user,
    password: await bcrypt.hash(user.password, 10),
  });
};

const postAuthentication = async (
  credentials: {
    email: string;
    password: string;
  } = {
    email: validUser.email,
    password: validUser.password,
  }
) => {
  return await request(app).post("/api/v1/auth").send(credentials);
};

describe("When credentials given is correct", () => {
  let response: request.Response;
  beforeAll(async () => {
    await createUser();
    response = await postAuthentication();
  });
  afterAll(async () => {
    User.destroy({ truncate: true });
  });
  it("returns status code 200", () => {
    expect(response.status).toBe(200);
  });
  it("returns only username and id", () => {
    expect(response.body.username).toBe(validUser.username);
    expect(response.body.id).toBeTruthy();
    expect(Object.keys(response.body)).toEqual(
      expect.arrayContaining(["id", "username", "token"])
    );
  });
});

describe("When input error or user does not exist in database", () => {
  let response: request.Response;
  beforeAll(async () => {
    response = await postAuthentication();
  });
  it("returns status code 401", () => {
    expect(response.status).toBe(401);
  });
  it("returns AuthenticationError", () => {
    expect(response.body.name).toBe("AuthenticationException");
    expect(response.body.message).toBe("Invalid account details provided");
  });
  it("return 401 when e-mail is not valid", async () => {
    response = await postAuthentication({
      email: "invalidformat",
      password: inactiveUser.password,
    });
    expect(response.status).toBe(401);
  });
  it("return 401 when password is not valid", async () => {
    response = await postAuthentication({
      email: inactiveUser.email,
      password: null,
    });
    expect(response.status).toBe(401);
  });
});
describe("When user does not exist in database", () => {
  let user: User;
  let response: request.Response;
  beforeAll(async () => {
    await createUser();
    user = await User.findOne({ where: { email: validUser.email } });
    response = await postAuthentication({
      email: validUser.email,
      password: "notvalidpassword",
    });
  });
  afterAll(async () => {
    User.destroy({ truncate: true });
  });
  it("returns status code 401", () => {
    expect(response.status).toBe(401);
  });
  it("returns AuthenticationError", () => {
    expect(response.body.name).toBe("AuthenticationException");
    expect(response.body.message).toBe("Invalid account details provided");
  });
});

describe("when logging in with an inactive account", () => {
  let user: User;
  let response: request.Response;
  beforeAll(async () => {
    await createUser(inactiveUser);
    user = await User.findOne({ where: { email: validUser.email } });
    response = await postAuthentication({
      email: inactiveUser.email,
      password: inactiveUser.password,
    });
  });
  afterAll(async () => {
    User.destroy({ truncate: true });
  });

  it("should return 403", () => {
    expect(response.status).toBe(403);
  });
  it("expect proper error body when logging in with inactive account", () => {
    expect(response.body.path).toBe("/api/v1/auth");
    expect(response.body.timestamp).toBeLessThanOrEqual(new Date().getTime());
    expect(Object.keys(response.body)).toEqual(
      expect.arrayContaining(["path", "timestamp", "message"])
    );
  });
});

describe("when credentials are correct", () => {
  let response: request.Response;
  beforeAll(async () => {
    await createUser(validUser);
    response = await postAuthentication();
  });
  afterAll(async () => {
    User.destroy({ truncate: true });
  });
  it("returns jwt token", () => {
    expect(response.body.token).not.toBeUndefined();
  });
});

describe("Logged Out", () => {
  it("returns 200 ok when unauthorized request send for logout", async () => {
    const response = await postLogout();
    expect(response.status).toBe(200);
  });
  it("removes the token from the database", async () => {
    await createUser();
    const response = await postAuthentication({
      email: validUser.email,
      password: validUser.password,
    });
    const token = response.body.token;
    await postLogout(token);
    const storedToken = await Token.findOne({ where: { token } });
    expect(storedToken).toBeNull();
  });
});
