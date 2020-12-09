import request from "supertest";

import User from "../src/model/User";
import { sequelize } from "../src/db/database";
import app from "../src/app";
import Hoax from "../src/model/Hoax";

const getHoaxes = () => {
  const agent = request(app).get(`/api/v1/hoaxes`);
  return agent;
};

const createHoaxes = async (count: number) => {
  for (let i = 0; i < count; i++) {
    const user = await User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@mail.com`,
      password: "temp",
    });
    await Hoax.create({
      content: `hoax content ${i + 1}`,
      timestamp: Date.now(),
      userId: user.id,
    });
  }
};

describe("Listing All Hoaxes", () => {
  beforeAll(async () => {
    await sequelize.sync();
  });

  afterEach(async () => {
    User.destroy({ truncate: true, cascade: true });
  });

  it("return 200 ok when there are no hoaxes in database", async () => {
    const response = await getHoaxes();
    expect(response.status).toBe(200);
  });

  it("returns page object as response body", async () => {
    const response = await getHoaxes();
    expect(response.body).toEqual({
      hoaxes: [],
      page: 0,
      size: 10,
      totalPages: 0,
    });
  });

  it("returns 10 hoaxes when there are 11 hoaxes in database", async () => {
    await createHoaxes(11);
    const response = await getHoaxes();
    expect(response.body.hoaxes.length).toBe(10);
  });

  it("returns hoaxes, id, timestamp and user object with id, username, email and image", async () => {
    await createHoaxes(11);
    const response = await getHoaxes();
    const hoax = response.body.hoaxes[0];
    const hoaxKeys = Object.keys(hoax);
    const userKeys = Object.keys(hoax.user);
    console.log(response.body);
    expect(hoaxKeys).toEqual(["id", "content", "timestamp", "user"]);
    expect(userKeys).toEqual(["id", "username", "email", "image"]);
  });
});
