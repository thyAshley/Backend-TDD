export class ValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.status = 400;
    this.name = "ValidationException";
  }
}
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
    this.status = 502;
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

export class AuthenticationException extends Error {
  constructor() {
    super();
    this.status = 401;
    this.message = "Invalid account details provided";
    this.name = "AuthenticationException";
  }
}

export class ForbiddenException extends Error {
  constructor(message: string = "You are not authorize to update the user") {
    super(message);
    this.status = 403;
    this.name = "ForbiddenException";
  }
}

export class NotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.status = 404;
    this.name = "ForbiddenException";
  }
}
