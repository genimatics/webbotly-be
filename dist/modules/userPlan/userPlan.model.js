"use strict";
// models/UserPlan.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanName = void 0;
const mongoose_1 = require("mongoose");
var PlanName;
(function (PlanName) {
    PlanName["FOUNDING_MEMBER"] = "founding-member";
    PlanName["FREE"] = "free";
    PlanName["TRIAL"] = "trial";
    PlanName["STARTER_MONTHLY"] = "starter-monthly";
    PlanName["STARTER_YEARLY"] = "starter-yearly";
    PlanName["STARTER_TRIAL"] = "starter-trial";
    PlanName["GROWTH_MONTHLY"] = "growth-monthly";
    PlanName["GROWTH_YEARLY"] = "growth-yearly";
    PlanName["GROWTH_TRIAL"] = "growth-trial";
    PlanName["SCALE_MONTHLY"] = "scale-monthly";
    PlanName["SCALE_YEARLY"] = "scale-yearly";
    PlanName["SCALE_TRIAL"] = "scale-trial";
})(PlanName || (exports.PlanName = PlanName = {}));
const UserPlanSchema = new mongoose_1.Schema({
    user: { type: String, required: true },
    planName: { type: String, required: true },
    planKey: { type: String, required: true },
    planStatus: { type: String, required: true },
    priceId: { type: String, required: true },
    paddleCustomerId: { type: String },
    subscriptionId: { type: String },
    isActive: { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
});
exports.default = (0, mongoose_1.model)("UserPlan", UserPlanSchema);
//# sourceMappingURL=userPlan.model.js.map