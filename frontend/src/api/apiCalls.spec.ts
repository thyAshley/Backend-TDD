import axios from "axios";
import * as apiCalls from "./apiCalls";

describe("apiCalls", () => {
  describe("when signup is called", () => {
    it("calls /api/v1/users", () => {
      const mockSignup = jest.fn();
      axios.post = mockSignup;
      apiCalls.signup();
      const path = mockSignup.mock.calls[0][0];
      expect(path).toBe("/api/v1/users");
    });
  });
});
