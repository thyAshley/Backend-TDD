import request from "supertest";
import app from "../src/app";
import { SMTPServer } from "smtp-server";
import bcrypt from "bcryptjs";
import { sequelize } from "../src/db/database";

import User from "../src/model/User";

const postPasswordReset = (email: string = "user1@mail.com") => {
  const agent = request(app).post("/api/v1/auth/forgot-password");

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
});

// const simulateSMTPFailure = false;

// const server = new SMTPServer({
//   authOptional: true,
//   onData(stream, session, callball) {
//     let mail: string;
//     stream.on("data", (data) => {
//       mail += data.toString();
//     });
//     stream.on("end", () => {
//       if (simulateSMTPFailure) {
//         const err = new Error("invalid mailbox");
//         callball(err);
//       }
//       lastMail = mail;
//       callball();
//     });
//   },
// });

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
    expect(response.body.path).toBe("/api/v1/auth/forgot-password");
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
    expect(response.body.path).toBe("/api/v1/auth/forgot-password");
    expect(response.body.timestamp).toBeLessThan(timeAfterRequest);
  });
});

describe("when password reset is sent for valid user", () => {
  let response: request.Response;
  beforeAll(async () => {
    await createUser();
    response = await postPasswordReset(validUser.email);
  });

  afterAll(async () => {
    User.destroy({ truncate: true });
  });
  it("returns status code 200", () => {
    expect(response.status).toBe(200);
  });
});
