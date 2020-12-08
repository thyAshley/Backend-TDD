import crypto from "crypto";

export const randomString = (length: number) => {
  return crypto.randomBytes(length).toString("hex").substring(0, length);
};
