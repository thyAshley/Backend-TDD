import request from "supertest";
import nodemailer from "nodemailer"; //do
import stubTransport from "nodemailer-stub-transport";

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
    password: "P4ssword",
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

  it.each`
    field         | value               | expectedMessage
    ${"username"} | ${null}             | ${"Username cannot be null"}
    ${"username"} | ${"adm"}            | ${"Username must be between 4 and 32 characters"}
    ${"username"} | ${"a".repeat(33)}   | ${"Username must be between 4 and 32 characters"}
    ${"password"} | ${null}             | ${"Password cannot be null"}
    ${"password"} | ${"123"}            | ${"Password must be at least 6 characters"}
    ${"password"} | ${"alllowercase"}   | ${"Password must have at least 1 uppercase, 1 lowercase and 1 number"}
    ${"password"} | ${"ALLUPPERCASE"}   | ${"Password must have at least 1 uppercase, 1 lowercase and 1 number"}
    ${"password"} | ${"1234567890"}     | ${"Password must have at least 1 uppercase, 1 lowercase and 1 number"}
    ${"password"} | ${"123UPPER"}       | ${"Password must have at least 1 uppercase, 1 lowercase and 1 number"}
    ${"password"} | ${"UPPERlower"}     | ${"Password must have at least 1 uppercase, 1 lowercase and 1 number"}
    ${"email"}    | ${null}             | ${"Email cannot be null"}
    ${"email"}    | ${"mail.com"}       | ${"Email is not valid"}
    ${"email"}    | ${"admin.mail.com"} | ${"Email is not valid"}
  `(
    "if $field is $value', $expectedMessage is received",
    async ({ field, expectedMessage, value }) => {
      const user = <IDic>{
        username: "admin",
        email: "test@gmail.com",
        password: "123123",
      };
      user[field] = value;
      const response = await postValidUser(user);
      expect(response.body.validationErrors[field]).toBe(expectedMessage);
    }
  );

  it.each`
    field
    ${"username"}
    ${"password"}
    ${"email"}
  `("if $field is null, expect status code 400", async ({ field }) => {
    const user = <IDic>{
      username: "admin",
      email: "admin@test.com",
      password: "123123",
    };
    user[field] = null;
    const response = await postValidUser(user);
    expect(response.status).toBe(400);
  });

  it("return 'E-mail already exist' when registering with same email", async () => {
    await User.create({ ...validUser });
    const response = await postValidUser();
    expect(response.body.validationErrors.email).toBe("E-mail already exist");
  });
  it("return error for both username is null and email is in use", async () => {
    await User.create({ ...validUser });
    const response = await postValidUser({
      ...validUser,
      username: null,
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(
      expect.arrayContaining(["email", "username"])
    );
  });
  it("create user in inactive mode", async () => {
    await postValidUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.active).toBe(false);
  });

  it("create user in inactive mode even if request body have active=true", async () => {
    const newUser = {
      ...validUser,
      active: true,
    };
    await postValidUser(newUser);
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.active).toBe(false);
  });

  it("create an activationToken for user", async () => {
    await postValidUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.activationToken).toBeTruthy();
  });
  it("sends an Account activation email with activationToken", async () => {
    await postValidUser();
    const user = await User.findOne({ where: { email: validUser.email } });
    const transport = nodemailer.createTransport(stubTransport());
    const send = await transport.sendMail({
      from: "Admin <admin@tdd.com>",
      to: user.email,
      subject: "Account Activation",
      html: `Token is ${user.activationToken}`,
    });
  });
});
