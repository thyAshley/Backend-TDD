export class InvalidTokenException extends Error {
  constructor() {
    super();
    this.status = 400;
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
    this.status = 500;
    this.message =
      "Unexpected Error Occur, Please try again or inform the administrators.";
    this.name = "UnexpectedException";
  }
}
export class UserNotFoundException extends Error {
  constructor() {
    super();
    this.status = 404;
    this.message = "User not found";
    this.name = "UserNotFoundException";
  }
}

export class AuthenticationException extends Error {
  constructor() {
    super();
    this.status = 401;
    this.message = "Invalid account details provided";
    this.name = "AuthenticationException";
  }
}

export class ForbiddenException extends Error {
  constructor() {
    super();
    this.status = 403;
    this.message = "You are unauthorize to perform this action";
    this.name = "ForbiddenException";
  }
}
