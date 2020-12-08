import { sequelize } from "../src/db/database";
import Token from "../src/model/Token";
import * as TokenService from "../src/utils/TokenService";

beforeAll(async () => {
  await sequelize.sync();
});

beforeEach(async () => {
  await Token.destroy({ truncate: true });
});

describe("SChedule Token Cleanup", () => {
  it("clears the expired token with scheduled task", async () => {
    jest.useFakeTimers();
    const token = "old-token";
    const expired = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    await Token.create({
      token,
      lastUsedAt: expired,
    });

    TokenService.scheduleCleanup();
    jest.advanceTimersByTime(60 * 60 * 1000 + 2000);
    const tokeninDB = await Token.findOne({ where: { token: token } });
    expect(tokeninDB).toBeNull();
  });
});
