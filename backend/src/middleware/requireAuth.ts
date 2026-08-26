import type { NextFunction, Request, Response } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  next();
};
