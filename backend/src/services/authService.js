import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "fallback_trackwise_secret_dev_key_2026",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email is already registered. Please log in.", 400);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};
