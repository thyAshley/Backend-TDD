import request from "supertest";

import User from "../src/model/User";
import app from "../src/app";
import { sequelize } from "../src/db/database";

interface IDic {
  [key: string]: string;
  username: string;
  email: string;
  password: string;
}

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

  it("returns 400 when email is null", async () => {
    const response = await postValidUser({
      username: "admin",
      email: null,
      password: "123123",
    });
    expect(response.status).toBe(400);
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

  it.each([
    ["username", "Username cannot be null"],
    ["email", "Email cannot be null"],
    ["password", "Password cannot be null"],
  ])("if %s is null', %s is received", async (field, message) => {
    const user = <IDic>{
      username: null,
      email: "test@gmail.com",
      password: "123123",
    };
    user[field] = null;
    const response = await postValidUser(user);
    expect(response.body.validationErrors[field]).toBe(message);
  });
});
