import React from "react";

const UserSignupPage = () => {
  return (
    <div>
      <h1 data-testid="header">Sign up</h1>
      <div>
        <input data-testid="nameInput" placeholder="Enter your name" />
      </div>
      <div>
        <input data-testid="usernameInput" placeholder="Enter your username" />
      </div>
      <div>
        <input
          data-testid="passwordInput"
          placeholder="Enter your password"
          type="password"
        />
      </div>
      <div>
        <input
          data-testid="confirmPasswordInput"
          placeholder="Confirm your password"
          type="password"
        />
      </div>
      <button data-testid="registerButton">Register</button>
    </div>
  );
};

export default UserSignupPage;
