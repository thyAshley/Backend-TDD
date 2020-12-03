import request from "supertest";

import User from "../src/model/User";
import { sequelize } from "../src/db/database";
import app from "../src/app";

const getUsers = () => {
  return request(app).get("/api/v1/users");
};

const createUsers = async (activeCount: number, inactiveCount: number = 0) => {
  for (let i = 0; i < activeCount + inactiveCount; i++) {
    User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@mail.com`,
      password: "Qweasd123",
      active: i < activeCount,
    });
  }
};

describe("Listing Users", () => {
  beforeAll(async () => {
    await sequelize.sync();
  });

  afterEach(async () => {
    return await User.destroy({ truncate: true });
  });

  it("returns 200 ok when there are no user in database", async () => {
    const response = await getUsers();
    expect(response.status).toBe(200);
  });
  it("returns page object as response body", async () => {
    const response = await getUsers();
    expect(response.body).toEqual({
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
    });
  });
  it("return 10 users in page content when there are 11 user in database", async () => {
    await createUsers(11, 0);
    const response = await request(app).get("/api/v1/users");
    expect(response.body.content).toHaveLength(10);
  });
  it("return 6 users in content when there are 6 active user and 5 inactive users", async () => {
    await createUsers(6, 5);
    const response = await request(app).get("/api/v1/users");
    expect(response.body.content).toHaveLength(6);
  });
});
