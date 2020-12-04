declare namespace Express {
  export interface Request {
    authorization: any;
    validationErrors: {};
    paginations: {
      page?: number;
      size?: number;
    };
  }
}
