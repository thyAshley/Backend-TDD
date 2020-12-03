declare namespace Express {
  export interface Request {
    validationErrors: {};
    paginations: {
      page?: number;
      size?: number;
    };
  }
}
