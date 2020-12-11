import request from "supertest";

import User from "../src/model/User";
import { sequelize } from "../src/db/database";
import app from "../src/app";
import Hoax from "../src/model/Hoax";
import { createHoax } from "../src/controllers/hoaxController";

const getHoaxes = () => {
  const agent = request(app).get(`/api/v1/hoaxes`);

  return agent;
};

const createHoaxes = async (count: number, userId?: number) => {
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
    expect(hoaxKeys).toEqual(["id", "content", "timestamp", "user"]);
    expect(userKeys).toEqual(["id", "username", "email", "image"]);
  });
  it("return 2 as totalPages when there are 11 hoaxes", async () => {
    await createHoaxes(11);
    const response = await getHoaxes();
    expect(response.body.totalPages).toBe(2);
  });
  it("return second page hoaxes when page is set to 1", async () => {
    await createHoaxes(11);
    const response = await getHoaxes().query({ page: 1 });
    expect(response.body.page).toBe(1);
    expect(response.body.hoaxes).toHaveLength(1);
  });
  it("return page 0 hoaxes when page is set to invalid value", async () => {
    const response = await getHoaxes().query({ page: -5 });
    expect(response.body.page).toBe(0);
  });
  it("return 5 hoaxes when size is set to 5", async () => {
    await createHoaxes(11);
    const response = await getHoaxes().query({ size: 5 });
    expect(response.body.page).toBe(0);
    expect(response.body.hoaxes).toHaveLength(5);
  });
  it("return 10 hoaxes when size is set to more than 100", async () => {
    await createHoaxes(11);
    const response = await getHoaxes().query({ size: 100 });
    expect(response.body.page).toBe(0);
    expect(response.body.hoaxes).toHaveLength(10);
  });
  it("returns hoaxes from newest to oldest", async () => {
    await createHoaxes(11);
    const response = await getHoaxes();
    const firstHoax = response.body.hoaxes[0];
    const lastHoax = response.body.hoaxes[9];
    expect(firstHoax.timestamp).toBeGreaterThanOrEqual(lastHoax.timestamp);
  });
});

describe("Listing Hoaxes of a user", () => {
  const createHoaxes = async (count: number, userId: string) => {
    for (let i = 0; i < count; i++) {
      await Hoax.create({
        content: `hoax content ${i + 1}`,
        timestamp: Date.now(),
        userId: userId,
      });
    }
  };

  const getUserHoaxes = (id: string) => {
    const agent = request(app).get(`/api/v1/hoaxes/users/${id}`);

    return agent;
  };

  const addUser = (id: number = 1) => {
    return User.create({
      username: `user${id}`,
      email: `user${id}@mail.com`,
      password: "P4ssword",
    });
  };

  beforeAll(async () => {
    await sequelize.sync();
  });

  afterEach(async () => {
    User.destroy({ truncate: true, cascade: true });
  });

  it("returns 200 ok when there is no hoaxes in database", async () => {
    const user = await addUser();
    const response = await getUserHoaxes(user.id);
    expect(response.status).toBe(200);
  });
  it("returns page object as response body", async () => {
    const user = await addUser();
    const response = await getUserHoaxes(user.id);
    expect(response.body).toEqual({
      hoaxes: [],
      page: 0,
      size: 10,
      totalPages: 0,
    });
  });
  it("returns 10 hoaxes in page with 11 hoaxes from user", async () => {
    const user = await addUser();
    await createHoaxes(11, user.id);
    const response = await getUserHoaxes(user.id);
    expect(response.body.hoaxes).toHaveLength(10);
  });
  it("return 5 hoaxes belonging to user when there 11 hoaxes for 2 users", async () => {
    const user = await addUser();
    await createHoaxes(5, user.id);
    const user2 = await addUser(2);
    await createHoaxes(6, user2.id);
    const response = await getUserHoaxes(user.id);
    expect(response.body.hoaxes).toHaveLength(5);
  });
  it("returns hoaxes, id, timestamp and user object with id, username, email and image", async () => {
    const user = await addUser();
    await createHoaxes(11, user.id);
    const response = await getUserHoaxes(user.id);
    const hoax = response.body.hoaxes[0];
    const hoaxKeys = Object.keys(hoax);
    const userKeys = Object.keys(hoax.user);
    expect(hoaxKeys).toEqual(["id", "content", "timestamp", "user"]);
    expect(userKeys).toEqual(["id", "username", "email", "image"]);
  });
  it("return 2 as totalPages when there are 11 hoaxes", async () => {
    const user = await addUser();
    await createHoaxes(11, user.id);
    const response = await getHoaxes();
    expect(response.body.totalPages).toBe(2);
  });
  it("return second page hoaxes when page is set to 1", async () => {
    const user = await addUser();
    await createHoaxes(11, user.id);
    const response = await getHoaxes().query({ page: 1 });
    expect(response.body.page).toBe(1);
    expect(response.body.hoaxes).toHaveLength(1);
  });
  it("return page 0 hoaxes when page is set to invalid value", async () => {
    const response = await getHoaxes().query({ page: -5 });
    expect(response.body.page).toBe(0);
  });
  it("return 5 hoaxes when size is set to 5", async () => {
    const user = await addUser();
    await createHoaxes(11, user.id);
    const response = await getHoaxes().query({ size: 5 });
    expect(response.body.page).toBe(0);
    expect(response.body.hoaxes).toHaveLength(5);
  });
  it("return 10 hoaxes when size is set to more than 100", async () => {
    const user = await addUser();
    await createHoaxes(11, user.id);
    const response = await getHoaxes().query({ size: 100 });
    expect(response.body.page).toBe(0);
    expect(response.body.hoaxes).toHaveLength(10);
  });
  it("returns hoaxes from newest to oldest", async () => {
    const user = await addUser();
    await createHoaxes(11, user.id);
    const response = await getHoaxes();
    const firstHoax = response.body.hoaxes[0];
    const lastHoax = response.body.hoaxes[9];
    expect(firstHoax.timestamp).toBeGreaterThanOrEqual(lastHoax.timestamp);
  });

  it("returns 404 when user does not exist", async () => {
    const response = await getUserHoaxes("15");
    expect(response.status).toBe(404);
  });
  it("returns error message when user does not exist", async () => {
    const beforeSend = Date.now();
    const response = await getUserHoaxes("15");
    expect(response.body.message).toBe("User does not exist");
    expect(response.body.path).toBe("/api/v1/hoaxes/users/15");
    expect(response.body.timestamp).toBeGreaterThan(beforeSend);
  });
});
