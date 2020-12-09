import {
  fireEvent,
  render,
  screen,
  act,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import UserSignupPage, { UserSignupProps } from "./UserSignupPage";

describe("Test UserSignupPage", () => {
  const validInput = {
    username: "user1",
    email: "user1@test.com",
    password: "P4ssword",
  };

  const createEvent = (content: string | number) => {
    return {
      target: {
        value: content,
      },
    };
  };
  let NameInput: HTMLElement,
    usernameInput: HTMLElement,
    passwordInput: HTMLElement,
    passwordRepeat: HTMLElement,
    Button: HTMLElement;

  const mockAsyncDelay = () => {
    return jest.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({});
        }, 300);
      });
    });
  };
  const failmockAsyncDelay = () => {
    return jest.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject({
            response: { data: {} },
          });
        }, 300);
      });
    });
  };
  const setupForSubmit = (props?: UserSignupProps) => {
    render(<UserSignupPage {...props} />);
    NameInput = screen.getByTestId("nameInput");
    usernameInput = screen.getByTestId("usernameInput");
    passwordInput = screen.getByTestId("passwordInput");
    passwordRepeat = screen.getByTestId("confirmPasswordInput");
    Button = screen.getByTestId("registerButton");

    fireEvent.change(NameInput, createEvent(validInput.email));
    fireEvent.change(usernameInput, createEvent(validInput.username));
    fireEvent.change(passwordInput, createEvent(validInput.password));
    fireEvent.change(passwordRepeat, createEvent(validInput.password));
    fireEvent.click(Button);
  };

  describe("Layouts", () => {
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
      expect(inputField).toHaveAttribute(
        "placeholder",
        "Confirm your password"
      );
      expect(inputField).toHaveAttribute("type", "password");
    });
    it("should contain a input field for register button", () => {
      const Button = screen.getByTestId("registerButton");
      expect(Button).toBeInTheDocument();
      expect(Button).toHaveTextContent(/register/i);
    });
  });
  describe("Functionalities", () => {
    const createEvent = (content: string | number) => {
      return {
        target: {
          value: content,
        },
      };
    };
    beforeEach(() => {
      render(<UserSignupPage />);
    });
    it("should allow user to key in their name", () => {
      const changeEvent = createEvent("user1");
      const inputField = screen.getByTestId("nameInput");
      fireEvent.change(inputField, changeEvent);
      expect(inputField).toHaveValue(changeEvent.target.value);
    });
    it("should allow user to key in their username", () => {
      const changeEvent = createEvent("user1");
      const inputField = screen.getByTestId("usernameInput");
      fireEvent.change(inputField, changeEvent);
      expect(inputField).toHaveValue(changeEvent.target.value);
    });
    it("should allow user to key in their password", () => {
      const changeEvent = createEvent("P4ssword");
      const inputField = screen.getByTestId("passwordInput");
      fireEvent.change(inputField, changeEvent);
      expect(inputField).toHaveValue(changeEvent.target.value);
    });
  });
  describe("When registering new user", () => {
    const successAction = {
      postSignup: jest.fn().mockResolvedValueOnce({}),
    };

    it("calls postSignup when the fields are valid", async () => {
      setupForSubmit({ actions: successAction });
      expect(successAction.postSignup).toHaveBeenCalledTimes(1);
      await waitForElementToBeRemoved(screen.getByTestId("loading"));
    });
    it("does not throw exception when actions is not provided", async () => {
      setupForSubmit();
      expect(() => fireEvent.click(Button)).not.toThrow();
      await waitForElementToBeRemoved(screen.getByTestId("loading"));
    });
    it("calls post with user body when fields are valid", async () => {
      const actions = {
        postSignup: jest.fn().mockResolvedValueOnce({}),
      };
      setupForSubmit({ actions });
      fireEvent.click(Button);
      const expectedUserObject = {
        username: validInput.username,
        email: validInput.email,
        password: validInput.password,
      };
      expect(actions.postSignup).toHaveBeenCalledWith(expectedUserObject);
      await waitForElementToBeRemoved(screen.getByTestId("loading"));
    });
    it("disable the sign up button when there is an ongoing api call", async () => {
      const actions = {
        postSignup: mockAsyncDelay(),
      };
      setupForSubmit({ actions });

      fireEvent.click(Button);
      expect(actions.postSignup).toHaveBeenCalledTimes(1);

      await waitForElementToBeRemoved(screen.getByTestId("loading"));
    });
    it("display spinner when there is an ongoing api call", async () => {
      const actions = {
        postSignup: mockAsyncDelay(),
      };
      setupForSubmit({ actions });

      const spinner = screen.getByTestId("loading");
      expect(spinner).toBeInTheDocument();

      await waitForElementToBeRemoved(screen.getByTestId("loading"));
    });
    it("hide display after api call finishes", async () => {
      const actions = {
        postSignup: mockAsyncDelay(),
      };
      setupForSubmit({ actions });
      const spinner = screen.getByTestId("loading");
      await waitForElementToBeRemoved(spinner);
      expect(spinner).not.toBeInTheDocument();
    });
    it("hide display after api call finishes with error", async () => {
      const actions = {
        postSignup: failmockAsyncDelay(),
      };
      setupForSubmit({ actions });
      const spinner = screen.getByTestId("loading");
      await waitForElementToBeRemoved(spinner);
      expect(spinner).not.toBeInTheDocument();
    });
  });
});
