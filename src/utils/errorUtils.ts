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
