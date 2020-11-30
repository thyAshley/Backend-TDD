import request from "supertest";

import User from "../src/model/User";
import app from "../src/app";
import { sequelize } from "../src/db/database";

describe("User Registration Route", () => {
  beforeAll(() => {
    return sequelize.sync();
  });

  beforeEach(() => {
    return User.destroy({ truncate: true });
  });

  const validUser = {
    username: "admin",
    email: "admin@test.com",
    password: "123123",
  };
  const postValidUser = (user = validUser) => {
    return request(app).post("/api/v1/users").send(user);
  };

  it("should return 200 OK when signup request is valid", async () => {
    const response = await postValidUser();
    expect(response.status).toBe(200);
  });

  it("should return success message when signup request is valid", async () => {
    const response = await postValidUser();
    expect(response.body.message).toBe("User created");
  });

  it("save the user to the database", async () => {
    await postValidUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it("save the username and email to the database", async () => {
    await postValidUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe("admin");
    expect(savedUser.email).toBe("admin@test.com");
  });

  it("hashes the saved password", async () => {
    await postValidUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).toHaveLength(60);
  });

  it("returns 400 when username is null", async () => {
    const response = await postValidUser({
      username: null,
      email: "admin@test.com",
      password: "123123",
    });

    expect(response.status).toBe(400);
  });

  it("returns 'Username cannot be null' when username is null", async () => {
    const response = await postValidUser({
      username: null,
      email: "admin@test.com",
      password: "123123",
    });
    expect(response.body.validationErrors.username).toBe(
      "Username cannot be null"
    );
  });

  it("returns 400 when email is null", async () => {
    const response = await postValidUser({
      username: "admin",
      email: null,
      password: "123123",
    });
    expect(response.status).toBe(400);
  });

  it("returns 'Email cannot be null' when email is null", async () => {
    const response = await postValidUser({
      username: "admin",
      email: null,
      password: "123123",
    });
    expect(response.body.validationErrors.email).toBe("Email cannot be null");
  });
  it("returns 'Password cannot be null' when email is null", async () => {
    const response = await postValidUser({
      username: "admin",
      email: "test@work.com",
      password: null,
    });
    expect(response.body.validationErrors.password).toBe(
      "Password cannot be null"
    );
  });

  it("returns all error message when username, email and password is null", async () => {
    const response = await postValidUser({
      username: null,
      email: null,
      password: null,
    });
    expect(Object.keys(response.body.validationErrors)).toEqual(
      expect.arrayContaining(["email", "username", "password"])
    );
  });
});
