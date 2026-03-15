import { Request, Response } from "express";
import * as userService from "./user.service";

export const createUser = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await userService.getUsers();
  res.json(users);
};

export const register = async (req: Request, res: Response) => {
  try {

    const result = await userService.registerUser(req.body);
      res.cookie("accessToken", result.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({
      message: "User registered successfully",
      user: result.user
    });
  }
  catch (error: any) {
    res.status(400).json({
      message: error.message || "Something went wrong",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await userService.loginUser(email, password);

    res.cookie("accessToken", result.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user: result.user,
    });
  }
  catch (error: any) {
    res.status(400).json({
      message: error.message || "Something went wrong",
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  res.status(200).json({
    message: "Logout successful"
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    await userService.forgotPasswordService(email);
    // Always return 200 to prevent email enumeration attacks
    return res.status(200).json({
      message: "If that email is registered, a password reset link has been sent."
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    await userService.resetPasswordService(token, password);
    return res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Something went wrong" });
  }
};