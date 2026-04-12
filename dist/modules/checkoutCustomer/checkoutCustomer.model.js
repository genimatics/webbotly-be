"use strict";
// models/CheckoutCustomer.ts
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CheckoutCustomerSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    name: { type: String },
    paddleCustomerId: { type: String },
    checkoutId: { type: String, required: true },
    subscriptionId: { type: String },
    priceId: { type: String, required: true },
    event: { type: Object },
    createdAt: { type: Date, default: Date.now },
});
exports.default = (0, mongoose_1.model)("CheckoutCustomer", CheckoutCustomerSchema);
//# sourceMappingURL=checkoutCustomer.model.js.map