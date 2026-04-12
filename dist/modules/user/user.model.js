"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    role: { type: Number, default: 0 },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=user.model.js.map