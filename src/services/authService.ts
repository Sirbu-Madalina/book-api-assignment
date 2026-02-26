import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel";
import { connect, disconnect } from "../repository/database";

// DTO used by controller -> service for registration
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

// DTO used by controller -> service for login
export type LoginInput = {
  email: string;
  password: string;
};

// Creates a user and returns the saved document
export async function registerUserService(input: RegisterInput) {
  try {
    await connect();

    const emailExists = await userModel.findOne({ email: input.email });
    if (emailExists) {
      // Attach HTTP status
      const err: any = new Error("Email already exists.");
      err.status = 409;
      throw err;
    }

    // Hash password before persisting user data
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(input.password, salt);

    const userObject = new userModel({
      name: input.name,
      email: input.email,
      password: passwordHashed,
    });

    const savedUser = await userObject.save();
    return savedUser;
  } finally {
    // Always close connection even when the service throws
    await disconnect();
  }
}

// Validates credentials and returns signed JWT payload data
export async function loginUserService(input: LoginInput) {
  try {
    await connect();

    const user = await userModel.findOne({ email: input.email });
    if (!user) {
      const err: any = new Error("Credentials do not match. Please try again.");
      err.status = 400;
      throw err;
    }

    const validPassword = await bcrypt.compare(input.password, user.password);
    if (!validPassword) {
      const err: any = new Error("Password or email is wrong.");
      err.status = 400;
      throw err;
    }

    const userId = user.id;

    // 2h token lifetime keeps sessions limited
    const token = jwt.sign(
      { name: user.name, email: user.email, id: userId },
      process.env.TOKEN_SECRET as string,
      { expiresIn: "2h" }
    );

    return { userId, token };
  } finally {
    await disconnect();
  }
}

// Shared token verification helper used by auth middleware/controllers
export function verifyJwtToken(token: string) {
  return jwt.verify(token, process.env.TOKEN_SECRET as string);
}
