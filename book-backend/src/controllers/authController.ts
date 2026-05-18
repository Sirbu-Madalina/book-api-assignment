//controllers now do only validation, HTTP response, calling service
import { type Request, type Response, type NextFunction } from "express";
import Joi, { ValidationResult } from "joi";
import { User } from "../interfaces/user";
import * as authService from "../services/authService";
import { sendPasswordResetEmail } from "../services/mailService";

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
    // If validation fails, it returns a 400 Bad Request with the validation error message.
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  try {
    // If the input is valid, the controller calls the service layer to create the user.
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

export async function forgotPassword(req: Request, res: Response) {
  const { error } = validateForgotPasswordInfo(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  try {
    const resetToken = await authService.createPasswordResetService(req.body.email);

    if (resetToken) {
      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail({
        to: req.body.email,
        resetLink,
      });
      console.log("Password reset link:", resetLink);
    }

    res.status(200).json({
      message: "If that email exists, a password reset link has been created.",
    });
  } catch (err: any) {
    res.status(err.status || 500).json({
      error: err.message || "Error creating password reset link",
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { error } = validateResetPasswordInfo(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  try {
    await authService.resetPasswordService(req.body.token, req.body.password);
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err: any) {
    res.status(err.status || 500).json({
      error: err.message || "Error resetting password",
    });
  }
}

// This function validates the registration input using Joi.
export function validateUserRegistrationInfo(data: User): ValidationResult {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().min(6).max(255).required(),
    password: Joi.string().min(6).max(25).required(),
  });

  return schema.validate(data);
}

// validate login input
export function validateUserLoginInfo(data: User): ValidationResult {
  const schema = Joi.object({
    email: Joi.string().email().min(6).max(255).required(),
    password: Joi.string().min(6).max(25).required(),
  });

  return schema.validate(data);
}

export function validateForgotPasswordInfo(data: { email: string }): ValidationResult {
  const schema = Joi.object({
    email: Joi.string().email().min(6).max(255).required(),
  });

  return schema.validate(data);
}

export function validateResetPasswordInfo(data: {
  token: string;
  password: string;
}): ValidationResult {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(25).required(),
  });

  return schema.validate(data);
}
