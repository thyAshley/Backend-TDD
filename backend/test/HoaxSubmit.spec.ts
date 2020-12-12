import request from "supertest";
import bcrypt from "bcryptjs";
import path from "path";

import app from "../src/app";
import { sequelize } from "../src/db/database";
import User from "../src/model/User";
import Hoax from "../src/model/Hoax";
import FileAttachment from "../src/model/FileAttachment";

const uploadFile = (file = "test-png.png") => {
  return request(app)
    .post("/api/v1/hoaxes/attachments")
    .attach("file", path.join(__dirname, "resources", file))
    .set("Connection", "keep-alive");
};

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
  username: "user5",
  email: "user5@mail.com",
  active: true,
};
const credentials = { email: validUser.email, password: "P4ssword" };

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
  await Hoax.destroy({ truncate: true, cascade: true });
  await FileAttachment.destroy({ truncate: true });
});

describe("When Posting hoax without authentication", () => {
  it("returns 401", async () => {
    const response = await postHoax();
    expect(response.status).toBe(401);
  });
  it("returns error message", async () => {
    const beforeSending = Date.now();
    const response = await postHoax();
    expect(response.body.message).toBe(
      "You are not authorize to update the user"
    );
    expect(response.body.path).toBe("/api/v1/hoaxes");
    expect(response.body.timestamp).toBeGreaterThan(beforeSending);
    expect(response.body.timestamp).toBeLessThan(Date.now());
  });
});

describe("When Posting hoax with valid authentication", () => {
  it("returns 200", async () => {
    await createUser();
    const response = await postHoax(
      { content: "Hoax content" },
      {
        auth: credentials,
      }
    );
    expect(response.status).toBe(200);
  });
  it("saves the hoax to database", async () => {
    await createUser();
    await postHoax(
      { content: "Hoax content" },
      {
        auth: credentials,
      }
    );
    const hoaxes = await Hoax.findAll();
    expect(hoaxes).toHaveLength(1);
  });
  it("returns success message", async () => {
    await createUser();
    const response = await postHoax(
      { content: "Hoax content" },
      {
        auth: credentials,
      }
    );
    expect(response.body.message).toContain("Hoax is saved");
  });
  it("save the hoax content and timestamp to database", async () => {
    const beforeSubmit = Date.now();
    await createUser();
    await postHoax(
      { content: "Hoax content" },
      {
        auth: credentials,
      }
    );
    const hoaxes = await Hoax.findAll();
    expect(hoaxes[0].content).toBe("Hoax content");
    expect(hoaxes[0].timestamp).toBeGreaterThan(beforeSubmit);
    expect(hoaxes[0].timestamp).toBeLessThan(Date.now());
  });
  it("stores user id into hoax table", async () => {
    const beforeSubmit = Date.now();
    const user = await createUser();
    await postHoax(
      { content: "Hoax content" },
      {
        auth: credentials,
      }
    );
    const hoaxes = await Hoax.findAll({ where: { userid: user.id } });
    expect(hoaxes).toHaveLength(1);
  });
});

describe("When Posting hoax with content less than 10 character", () => {
  it("returns status code 400", async () => {
    await createUser();
    const response = await postHoax(
      { content: "invalid" },
      {
        auth: credentials,
      }
    );
    expect(response.status).toBe(400);
  });
  it("returns error body when invalid hoax is posted", async () => {
    const beforeSending = Date.now();
    await createUser();
    const response = await postHoax(
      { content: "invalid" },
      {
        auth: credentials,
      }
    );

    expect(response.body.path).toBe("/api/v1/hoaxes");
    expect(response.body.timestamp).toBeGreaterThan(beforeSending);
    expect(Object.keys(response.body)).toEqual([
      "validationErrors",
      "message",
      "path",
      "timestamp",
    ]);
  });
  it.each`
    content            | description          | message
    ${null}            | ${"null"}            | ${"Hoaxes must be between 10 to 500 character long"}
    ${"a".repeat(9)}   | ${"under 10 char"}   | ${"Hoaxes must be between 10 to 500 character long"}
    ${"a".repeat(501)} | ${"exceed 500 char"} | ${"Hoaxes must be between 10 to 500 character long"}
  `(
    "returns $message when $description is send",
    async ({ content, message }) => {
      await createUser();
      const response = await postHoax(
        { content: content },
        {
          auth: credentials,
        }
      );
      expect(response.body.validationErrors.content).toBe(message);
    }
  );

  it("associates hoax with attachment in database", async () => {
    const uploadResponse = await uploadFile();
    const uploadId = uploadResponse.body.id;
    await createUser();
    await postHoax(
      { content: "Hoax content", fileAttachment: uploadId },
      {
        auth: credentials,
      }
    );
    const hoaxes = await Hoax.findAll();
    const attachmentinDB = await FileAttachment.findOne({
      where: { id: uploadId },
    });
    expect(attachmentinDB.hoaxId).toBe(hoaxes[0].id);
  });

  it("returns 200 when attachment does not exist", async () => {
    await createUser();
    const response = await postHoax(
      { content: "Hoax content", fileAttachment: 1000 },
      {
        auth: credentials,
      }
    );
    expect(response.status).toBe(200);
  });
});
