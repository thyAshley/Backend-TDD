import request from "supertest";

import User from "../src/model/User";
import app from "../src/app";
import { sequelize } from "../src/db/database";
import { SMTPServer } from "smtp-server";

interface IDic {
  [key: string]: string;
  username: string;
  email: string;
  password: string;
  activationToken: string;
  active: string;
}

let lastMail: string;
let simulateSMTPFailure = false;

const server = new SMTPServer({
  authOptional: true,
  onData(stream, session, callball) {
    let mail: string;
    stream.on("data", (data) => {
      mail += data.toString();
    });
    stream.on("end", () => {
      if (simulateSMTPFailure) {
        const err = new Error("invalid mailbox");
        callball(err);
      }
      lastMail = mail;
      callball();
    });
  },
});

const validUser = {
  username: "admin",
  email: "admin@test.com",
  password: "P4ssword",
};

const postValidUser = (user = validUser) => {
  return request(app).post("/api/v1/users").send(user);
};

describe("User Registration Route", () => {
  beforeAll(async () => {
    await server.listen(8587, "localhost");
    return sequelize.sync();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    simulateSMTPFailure = false;
    return User.destroy({ truncate: true });
  });

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
  it("return 502 Bad Gateway when sending email fails", async () => {
    simulateSMTPFailure = true;
    const response = await postValidUser();
    expect(response.status).toBe(502);
  });
  it("return Email failure message when sending email fails", async () => {
    simulateSMTPFailure = true;
    const response = await postValidUser();
    expect(response.body.message).toBe("E-mail Failure");
  });
  it("send an account action email with activationToken", async () => {
    await postValidUser();
    await server.close();
    const user = await User.findAll();
    expect(lastMail).toContain(user[0].email);
    expect(lastMail).toContain(user[0].activationToken);
  });
});

describe("When token is valid", () => {
  let user: User;
  let response: request.Response;
  beforeAll(async () => {
    await postValidUser();
    user = await User.findOne({ where: { email: validUser.email } });
    const token = user.activationToken;
    response = await request(app)
      .post(`/api/v1/users/activation/${token}`)
      .send();
    user = await User.findOne({ where: { email: validUser.email } });
  });
  afterAll(async () => {
    return await User.destroy({ truncate: true });
  });
  it("should set user to active", () => {
    expect(user.active).toBe(true);
  });

  it("Set user token to null after activation", () => {
    expect(user.activationToken).toBe(null);
  });

  it("Return success message", () => {
    expect(response.body.message).toBe("Account has been activated");
  });
});

describe("When token is not valid", () => {
  let user: User;
  let response: request.Response;
  beforeAll(async () => {
    await postValidUser();
    user = await User.findOne({ where: { email: validUser.email } });
    response = await request(app)
      .post(`/api/v1/users/activation/invalidToken`)
      .send();
    user = await User.findOne({ where: { email: validUser.email } });
  });
  afterAll(async () => {
    return await User.destroy({ truncate: true });
  });
  it("should not set user to active", () => {
    expect(user.active).toBe(false);
  });

  it("should not set user token to null", () => {
    expect(user.activationToken).not.toBe(null);
  });

  it("return bad request 400 when token is wrong", () => {
    expect(response.status).toBe(400);
  });

  it("return error message when token is wrong", () => {
    console.log(response.body);
    expect(response.body.message).toBe(
      "Invalid token sent, Account Activation Failed"
    );
  });
});
