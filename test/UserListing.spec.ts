import request from "supertest";

import User from "../src/model/User";
import { sequelize } from "../src/db/database";
import app from "../src/app";

const getUsers = () => {
  return request(app).get(`/api/v1/users`);
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
  it("return 10 users in page content when there are 11 active user in database", async () => {
    await createUsers(11, 0);
    const response = await getUsers();
    expect(response.body.content).toHaveLength(10);
  });
  it("return 6 users in content when there are 6 active user and 5 inactive users", async () => {
    await createUsers(6, 5);
    const response = await getUsers();
    expect(response.body.content).toHaveLength(6);
  });
  it("return only id, username and email in content array", async () => {
    await createUsers(1);
    const response = await getUsers();
    expect(Object.keys(response.body.content[0])).toEqual(
      expect.arrayContaining(["id", "username", "email"])
    );
  });
  it("return 2 totalPage when 10 < active user < 20", async () => {
    await createUsers(16, 6);
    const response = await getUsers();
    expect(response.body.totalPages).toBe(2);
  });

  it("returns second page and page indicator when page is set as 1", async () => {
    await createUsers(11);
    const response = await getUsers().query({ page: 1 });
    expect(response.body.content[0].username).toBe("user11");
    expect(response.body.page).toBe(1);
  });
  it("returns first page when page is set below zero", async () => {
    await createUsers(11);
    const response = await getUsers().query({ page: -5 });
    expect(response.body.page).toBe(0);
  });
  it("return 5 users when size is set to 5", async () => {
    await createUsers(11);
    const response = await getUsers().query({ size: 5 });
    expect(response.body.content).toHaveLength(5);
    expect(response.body.size).toBe(5);
  });
  it("return 10 users and size indicator when size is set to 100", async () => {
    await createUsers(11);
    const response = await getUsers().query({ size: 100 });
    expect(response.body.content).toHaveLength(10);
    expect(response.body.size).toBe(10);
  });
  it("return 10 users and size indicator when size is set to negative", async () => {
    await createUsers(11);
    const response = await getUsers().query({ size: -1 });
    expect(response.body.content).toHaveLength(10);
    expect(response.body.size).toBe(10);
  });
  it("return page as zero and size as 10 when invalid params are given", async () => {
    await createUsers(11);
    const response = await getUsers().query({ size: "size", page: "page" });
    expect(response.body.content).toHaveLength(10);
    expect(response.body.size).toBe(10);
    expect(response.body.page).toBe(0);
  });
});

const getUser = (id: string = "5") => {
  return request(app).get(`/api/v1/users/${id}`);
};

describe("When Invalid user is requested", () => {
  let response: any;
  beforeEach(async () => {
    response = await getUser("5");
  });
  it("should return status 404", async () => {
    expect(response.status).toBe(404);
  });
  it("should return message: 'User not found' ", async () => {
    expect(response.body.message).toBe("User not found");
  });
  it("should return message: 'User not found' ", async () => {
    expect(Object.keys(response.body)).toEqual(
      expect.arrayContaining(["message", "name"])
    );
  });
});

describe("When valid active user is requested", () => {
  let response: any;
  beforeAll(async () => {
    const user = await User.create({
      username: "validuser",
      email: "validuser@email.com",
      active: true,
    });
    response = await getUser(user.id);
  });
  afterAll(async () => {
    return await User.destroy({ truncate: true });
  });

  it("should return status 200", async () => {
    expect(response.status).toBe(200);
  });
  it("should return username, email and id of user", async () => {
    expect(Object.keys(response.body)).toEqual(
      expect.arrayContaining(["username", "email", "id"])
    );
  });
});

describe("When valid inactive user is requested", () => {
  let response: any;
  beforeAll(async () => {
    const user = await User.create({
      username: "validuser",
      email: "validuser@email.com",
      active: false,
    });
    response = await getUser(user.id);
  });
  afterAll(async () => {
    return await User.destroy({ truncate: true });
  });

  it("should return status 404", async () => {
    expect(response.status).toBe(404);
  });
});
