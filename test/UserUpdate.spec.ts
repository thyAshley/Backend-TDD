import request from "supertest";

import User from "../src/model/User";
import { sequelize } from "../src/db/database";
import app from "../src/app";

beforeAll(async () => {
  await sequelize.sync();
});

describe("Update user", () => {
  it("return forbidden when request is sent without authorization", async () => {
    const response = await request(app).put("/api/v1/users/5").send();
    expect(response.status).toBe(403);
  });
});
