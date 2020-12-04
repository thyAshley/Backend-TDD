export class InvalidTokenException extends Error {
  constructor() {
    super();
    this.message = "Invalid token sent, Account Activation Failed";
    this.name = "InvalidTokenException";
  }
}

export class EmailException extends Error {
  constructor() {
    super();
    this.message = "E-mail already exist";
    this.name = "EmailException";
  }
}
export class UnexpectedException extends Error {
  constructor() {
    super();
    this.message =
      "Unexpected Error Occur, Please try again or inform the administrators.";
    this.name = "UnexpectedException";
  }
}
export class UserNotFoundException extends Error {
  constructor() {
    super();
    this.message = "User not found";
    this.name = "UserNotFoundException";
  }
}
