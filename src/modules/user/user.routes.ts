import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

export default router;