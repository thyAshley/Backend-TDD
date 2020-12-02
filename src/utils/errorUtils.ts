export class InvalidTokenException extends Error {
  constructor() {
    super();
    this.message = "Invalid token sent, Account Activation Failed";
    this.name = "InvalidTokenException";
  }
}
