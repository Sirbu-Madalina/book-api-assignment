//controllers now do only validation, HTTP response, calling service

import { type Request, type Response, type NextFunction } from "express";
import Joi, { ValidationResult } from "joi";
import { User } from "../interfaces/user";
import * as authService from "../services/authService";

export type AuthRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.header("auth-token");

  if (!token) {
    res.status(401).json({ error: "Access Denied." });
    return;
  }

  try {
    const decoded = authService.verifyJwtToken(token) as {
      id: string;
      name: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid Token");
  }
}

export async function registerUser(req: Request, res: Response) {
  // validate
  const { error } = validateUserRegistrationInfo(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  try {
    const savedUser = await authService.registerUserService(req.body);
    res.status(201).json({ error: null, data: savedUser._id });
  } catch (err: any) {
    res.status(err.status || 500).json({
      error: err.message || "Error registering user",
    });
  }
}

export async function loginUser(req: Request, res: Response) {
  // validate
  const { error } = validateUserLoginInfo(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  try {
    const { userId, token, yearlyReadingGoal } =
      await authService.loginUserService(req.body);
      res.status(200).header("auth-token", token).json({
      error: null,
      data: { userId, token, yearlyReadingGoal },
    });
  } catch (err: any) {
    res.status(err.status || 500).json({
      error: err.message || "Error logging in user",
    });
  }
}

// validate registration
export function validateUserRegistrationInfo(data: User): ValidationResult {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().min(6).max(255).required(),
    password: Joi.string().min(6).max(25).required(),
  });

  return schema.validate(data);
}

// validate login
export function validateUserLoginInfo(data: User): ValidationResult {
  const schema = Joi.object({
    email: Joi.string().email().min(6).max(255).required(),
    password: Joi.string().min(6).max(25).required(),
  });

  return schema.validate(data);
}
