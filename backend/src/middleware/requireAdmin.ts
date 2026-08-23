import type { NextFunction, Request, Response } from "express";

// blocks the request unless the session holds a signed-in admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  if (user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};
