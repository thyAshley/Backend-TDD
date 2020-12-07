import request from "supertest";
import app from "../src/app";
import bcrypt from "bcryptjs";
import { SMTPServer } from "smtp-server";
import { sequelize } from "../src/db/database";

import User from "../src/model/User";
import Token from "../src/model/Token";

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

const putPasswordUpdate = (password: string, token: string) => {
  return request(app).put("/api/v1/auth/password").send({ password, token });
};

const postPasswordReset = (email: string = "user1@mail.com") => {
  const agent = request(app).post("/api/v1/auth/password");
  return agent.send({ email });
};

const validUser = {
  username: "user1",
  email: "user1@mail.com",
  active: true,
};
const invalidUser = {
  ...validUser,
  active: false,
};

const createUser = async (user = validUser) => {
  return await User.create({
    ...user,
    password: await bcrypt.hash("P4ssword", 10),
  });
};
beforeAll(async () => {
  await sequelize.sync();
  await server.listen(8587, "localhost");
});

afterAll(async () => {
  await server.close();
});

describe("Sending Password Request for unknown user", () => {
  let response: request.Response;

  beforeAll(async () => {
    response = await postPasswordReset("invalid@gmail.com");
  });

  it("returns 404 not found", () => {
    expect(response.status).toBe(404);
  });
  it("received fail message", () => {
    const timeAfterRequest = new Date().getTime();
    expect(response.body.message).toBe("Email not found");
    expect(response.body.path).toBe("/api/v1/auth/password");
    expect(response.body.timestamp).toBeLessThan(timeAfterRequest);
  });
});

describe("Sending Password Request without email address", () => {
  let response: request.Response;

  beforeAll(async () => {
    response = await postPasswordReset(null);
  });

  it("returns 400 not found", () => {
    expect(response.status).toBe(400);
  });
  it("received fail message", () => {
    const timeAfterRequest = new Date().getTime();
    expect(response.body.message).toBe("Invalid Email Format");
    expect(response.body.name).toBe("ValidationException");
    expect(response.body.path).toBe("/api/v1/auth/password");
    expect(response.body.timestamp).toBeLessThan(timeAfterRequest);
  });
});

describe("when password reset is sent for valid user", () => {
  let response: request.Response;
  let user: User;
  beforeAll(async () => {
    await createUser();
    response = await postPasswordReset(validUser.email);
    user = await User.findOne({ where: { email: validUser.email } });
  });

  afterAll(async () => {
    simulateSMTPFailure = false;
    await User.destroy({ truncate: true });
  });
  it("returns status code 200", () => {
    expect(response.status).toBe(200);
  });
  it("return success body message", () => {
    expect(response.body.message).toBe(
      "Check your e-mail for resetting your password"
    );
  });
  it("creates a password reset token", () => {
    expect(user.passwordResetToken).toBeTruthy();
  });
  it("sends a password reset email with password reset token", () => {
    expect(lastMail).toContain(validUser.email);
    expect(lastMail).toContain(user.passwordResetToken);
  });
  it("return 502 bad gateway when sending email fail", async () => {
    simulateSMTPFailure = true;
    response = await postPasswordReset(validUser.email);
    expect(response.status).toBe(502);
  });
});

describe("When password reset request without a change request token", () => {
  let response: request.Response;
  beforeAll(async () => {
    response = await putPasswordUpdate("P4ssword2", null);
  });
  it("return status code 403", () => {
    expect(response.status).toBe(403);
  });
  it("return error messages", () => {
    const timeAfterRequest = new Date().getTime();
    expect(response.body.message).toBe(
      "You are not authorized to perform this action, you may have provided an incorrect key"
    );
    expect(response.body.name).toBe("ForbiddenException");
    expect(response.body.path).toBe("/api/v1/auth/password");
    expect(response.body.timestamp).toBeLessThan(timeAfterRequest);
  });
});

describe("When password reset request is sent with invalid token", () => {
  let response: request.Response;
  beforeAll(async () => {
    response = await putPasswordUpdate("P4ssword2", "invalid token");
  });
  it("return status code 403", () => {
    expect(response.status).toBe(403);
  });
  it("return error messages", () => {
    const timeAfterRequest = new Date().getTime();
    expect(response.body.message).toBe(
      "You are not authorized to perform this action, you may have provided an incorrect key"
    );
    expect(response.body.name).toBe("ForbiddenException");
    expect(response.body.path).toBe("/api/v1/auth/password");
    expect(response.body.timestamp).toBeLessThan(timeAfterRequest);
  });
});

describe("When password reset request is sent with valid token but invalid password", () => {
  let response: request.Response;
  let user: User;
  beforeAll(async () => {
    user = await createUser();
    user.passwordResetToken = "test-token";
    await user.save();
    response = await putPasswordUpdate("notvalid", user.passwordResetToken);
  });
  afterAll(async () => {
    await User.destroy({ truncate: true });
  });
  it("return status code 400", () => {
    expect(response.status).toBe(400);
    expect(response.body.path).toBe("/api/v1/auth/password");
  });
});

describe("When password reset request is sent with valid token and valid password", () => {
  let response: request.Response;
  let user: User;
  let userinDB: User;

  beforeAll(async () => {
    user = await createUser();
    user.passwordResetToken = "test-token";
    await Token.create({
      token: "token-1",
      userId: user.id,
      lastUsedAt: Date.now(),
    });
    await Token.create({
      token: "token-2",
      userId: user.id,
      lastUsedAt: Date.now(),
    });
    await Token.create({
      token: "token-3",
      lastUsedAt: Date.now(),
    });
    await user.save();
    response = await putPasswordUpdate("P4ssword-1", user.passwordResetToken);
    userinDB = await User.findOne({ where: { email: validUser.email } });
  });
  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
    await Token.destroy({ truncate: true });
  });
  it("return status code 200", () => {
    expect(response.status).toBe(200);
  });
  it("update password in db", async () => {
    expect(userinDB.password).not.toEqual(user.password);
  });
  it("sets clears the reset token in database", async () => {
    expect(userinDB.passwordResetToken).toBeNull();
  });
  it("clears all token of user", async () => {
    const tokens = await Token.findAll({ where: { userId: user.id } });
    expect(tokens).toHaveLength(0);
  });
  it("does not clear token of other user", async () => {
    const tokens = await Token.findAll();
    expect(tokens).toHaveLength(1);
  });
});

describe("When requesting password reset for inactive account", () => {
  let response: request.Response;
  let user: User;
  beforeAll(async () => {
    await createUser(invalidUser);
    response = await postPasswordReset(invalidUser.email);
    user = await User.findOne({ where: { email: invalidUser.email } });
  });
  afterAll(async () => {
    await User.destroy({ truncate: true });
  });
  it("return status 400", () => {
    expect(response.status).toBe(400);
  });
  it("return error message", () => {
    expect(response.body.message).toBe(
      "Account is not activated, please activate your account first"
    );
  });
  it("does not provide a reset token", () => {
    expect(user.activationToken).toBeNull();
  });
});
