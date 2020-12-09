import React from "react";
import { useState } from "react";

export interface UserSignupProps {
  actions?: {
    postSignup: (user: {
      username: string;
      email: string;
      password: string;
    }) => any;
  };
}
const UserSignupPage = ({ actions }: UserSignupProps) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const onSignupHandler = async () => {
    setLoading(true);
    const createUser = {
      username,
      email,
      password,
    };
    if (actions) {
      try {
        await actions?.postSignup(createUser);
      } catch (error) {
        setError(error);
      }
      setLoading(false);
    }
  };
  return (
    <div className="container mt-5">
      <h1 data-testid="header" className="text-center">
        Sign up
      </h1>
      <div className="col-12 mb-3">
        <label>Email</label>
        <input
          className="form-control"
          data-testid="nameInput"
          placeholder="Enter your name"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="col-12 mb-3">
        <label>Username</label>
        <input
          className="form-control"
          data-testid="usernameInput"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="col-12 my-3">
        <label>Password</label>
        <input
          className="form-control"
          data-testid="passwordInput"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="col-12 mb-3">
        <label>Repeat Password</label>
        <input
          className="form-control"
          data-testid="confirmPasswordInput"
          placeholder="Confirm your password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button
        className="btn btn-primary"
        onClick={onSignupHandler}
        data-testid="registerButton"
        disabled={loading}
      >
        {loading && (
          <div
            data-testid="loading"
            className="spinner-border text-light spinner-border-sm mr-sm-1"
          ></div>
        )}
        Register
      </button>
    </div>
  );
};

UserSignupPage.defaultProps = {
  actions: {
    postSignup: () => new Promise((res, rej) => res({})),
  },
};

export default UserSignupPage;
