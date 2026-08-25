import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../utils/auth.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.auth_token;

  if (typeof token !== "string") {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const userId = await verifyAuthToken(token);

    res.locals.userId = userId;

    next();
  } catch {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}