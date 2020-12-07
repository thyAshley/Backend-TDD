import request from "supertest";
import app from "../src/app";
import bcrypt from "bcryptjs";
import { SMTPServer } from "smtp-server";
import { sequelize } from "../src/db/database";

import User from "../src/model/User";

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
  await server.listen(8587, "localhost");
});

afterAll(async () => {
  await server.close();
});

describe("Sending Password Request for unknown user", () => {
  let response: request.Response;

  beforeAll(async () => {
    response = await postPasswordReset();
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
    User.destroy({ truncate: true });
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
    User.destroy({ truncate: true });
  });
  it("return status code 400", () => {
    expect(response.status).toBe(400);
    expect(response.body.path).toBe("/api/v1/auth/password");
  });
});
describe("When password reset request is sent with valid token and valid password", () => {
  let response: request.Response;
  let user: User;
  beforeAll(async () => {
    user = await createUser();
    user.passwordResetToken = "test-token";
    await user.save();
    response = await putPasswordUpdate("P4ssword-1", user.passwordResetToken);
  });
  afterAll(async () => {
    User.destroy({ truncate: true });
  });
  it("return status code 200", () => {
    expect(response.status).toBe(200);
  });
  it("update password in db", async () => {
    const userInDb = await User.findOne({ where: { email: validUser.email } });

    expect(userInDb.password).not.toEqual(user.password);
  });
});
