import request from "supertest";

import User from "../src/model/User";
import app from "../src/app";
import { sequelize } from "../src/db/database";

describe("User Registration Route", () => {
  beforeAll(() => {
    return sequelize.sync();
  });

  beforeEach(() => {
    return User.destroy({ truncate: true });
  });

  const postValidUser = () => {
    return request(app).post("/api/v1/users").send({
      username: "admin",
      email: "admin@test.com",
      password: "123123",
    });
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
});
