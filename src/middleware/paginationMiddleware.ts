import { Request, Response, NextFunction } from "express";

export const pagination = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, size } = req.query;
  let offset = Number(page) || 0;
  let userSize = Number(size) || 10;
  if (offset < 0) offset = 0;
  if (userSize > 10 || userSize < 0) userSize = 10;
  req.paginations = {
    page: offset,
    size: userSize,
  };
  next();
};
