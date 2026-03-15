import crypto from "crypto";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { sendPasswordResetEmail } from "../../config/email.service";
import { ENV } from "../../config/env";
import User from "./user.model";

export const createUser = async (data: any) => {
  return await User.create(data);
};

export const getUsers = async () => {
  return await User.find();
};

export const registerUser = async (data: any) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    ...data,
    password: hashedPassword,
  });
  const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET);

  return { user: { ...user.toObject(), password: undefined }, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email, isDeleted: false });

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET);

  return { user, token };
};

export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email, isDeleted: false });

  // Always respond with success to avoid email enumeration
  if (!user) return;

  // Generate a secure random token and store its SHA-256 hash
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await sendPasswordResetEmail(email, rawToken);
};

export const resetPasswordService = async (
  rawToken: string,
  newPassword: string,
) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: new Date() },
    isDeleted: false,
  });

  if (!user) throw new Error("Reset token is invalid or has expired.");

  await User.findByIdAndUpdate(user._id, {
    $set: { password: await bcrypt.hash(newPassword, 10) },
    $unset: { resetPasswordToken: 1, resetPasswordExpiry: 1 },
  });
};
