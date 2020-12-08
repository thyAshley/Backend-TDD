import { render, screen } from "@testing-library/react";
import UserSignupPage from "./UserSignupPage";

describe("UserSignupPage layout", () => {
  beforeEach(() => {
    render(<UserSignupPage />);
  });
  it("should contain a header with text sign up", () => {
    const header = screen.getByTestId("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent(/sign up/i);
  });
  it("should contain a input field for name", () => {
    const inputField = screen.getByTestId("nameInput");
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveAttribute("placeholder", "Enter your name");
  });
  it("should contain a input field for username", () => {
    const inputField = screen.getByTestId("usernameInput");
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveAttribute("placeholder", "Enter your username");
  });
  it("should contain a input field for password with type password", () => {
    const inputField = screen.getByTestId("passwordInput");
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveAttribute("placeholder", "Enter your password");
    expect(inputField).toHaveAttribute("type", "password");
  });
  it("should contain a input field for confirm password with type password", () => {
    const inputField = screen.getByTestId("confirmPasswordInput");
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveAttribute("placeholder", "Confirm your password");
    expect(inputField).toHaveAttribute("type", "password");
  });
  it("should contain a input field for register button", () => {
    const Button = screen.getByTestId("registerButton");
    expect(Button).toBeInTheDocument();
    expect(Button).toHaveTextContent(/register/i);
  });
});
