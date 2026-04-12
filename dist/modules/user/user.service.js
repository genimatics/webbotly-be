"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordService = exports.forgotPasswordService = exports.loginUser = exports.registerUser = exports.getUsers = exports.createUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_service_1 = require("../../config/email.service");
const env_1 = require("../../config/env");
const user_model_1 = __importDefault(require("./user.model"));
const createUser = async (data) => {
    return await user_model_1.default.create(data);
};
exports.createUser = createUser;
const getUsers = async () => {
    return await user_model_1.default.find();
};
exports.getUsers = getUsers;
const registerUser = async (data) => {
    const existing = await user_model_1.default.findOne({ email: data.email });
    if (existing) {
        throw new Error("Email already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    const user = await user_model_1.default.create({
        ...data,
        password: hashedPassword,
    });
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, env_1.ENV.JWT_SECRET);
    return { user: { ...user.toObject(), password: undefined }, token };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await user_model_1.default.findOne({ email, isDeleted: false });
    if (!user)
        throw new Error("Invalid credentials");
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    user.lastLogin = new Date();
    await user.save();
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, env_1.ENV.JWT_SECRET);
    return { user, token };
};
exports.loginUser = loginUser;
const forgotPasswordService = async (email) => {
    const user = await user_model_1.default.findOne({ email, isDeleted: false });
    // Always respond with success to avoid email enumeration
    if (!user)
        return;
    // Generate a secure random token and store its SHA-256 hash
    const rawToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    await (0, email_service_1.sendPasswordResetEmail)(email, rawToken);
};
exports.forgotPasswordService = forgotPasswordService;
const resetPasswordService = async (rawToken, newPassword) => {
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    const user = await user_model_1.default.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: new Date() },
        isDeleted: false,
    });
    if (!user)
        throw new Error("Reset token is invalid or has expired.");
    await user_model_1.default.findByIdAndUpdate(user._id, {
        $set: { password: await bcryptjs_1.default.hash(newPassword, 10) },
        $unset: { resetPasswordToken: 1, resetPasswordExpiry: 1 },
    });
};
exports.resetPasswordService = resetPasswordService;
//# sourceMappingURL=user.service.js.map