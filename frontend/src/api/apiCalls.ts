import axios from "axios";

export const signup = (user?: {
  username: string;
  email: string;
  password: string;
}) => {
  return axios.post("/api/v1/users", user);
};
