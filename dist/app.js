"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_1 = require("./config/swagger");
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const webContent_routes_1 = __importDefault(require("./modules/webContent/webContent.routes"));
const chatbot_routes_1 = __importDefault(require("./modules/chatbot/chatbot.routes"));
const chatbotPersonality_routes_1 = __importDefault(require("./modules/chatbotPersonality/chatbotPersonality.routes"));
const chatMessage_routes_1 = __importDefault(require("./modules/chatMessage/chatMessage.routes"));
// import bookingRoutes from "./modules/bookings/booking.routes"
const crawler_routes_1 = __importDefault(require("./modules/crawler/crawler.routes"));
// import paymentPlanRoutes from "./modules/paymentPlan/paymentPlan.routes"
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://dome-fe.vercel.app'],
    credentials: true,
}));
dotenv_1.default.config();
(0, swagger_1.setupSwagger)(app);
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use("/api/users", user_routes_1.default);
app.use("/api/crawler", crawler_routes_1.default);
app.use("/api/chatbot", chatbot_routes_1.default);
app.use("/api/content", webContent_routes_1.default);
// app.use("/api/booking", bookingRoutes);
app.use("/api/chatbotPersonality", chatbotPersonality_routes_1.default);
app.use("/api/chatbotMessage", chatMessage_routes_1.default);
// app.use("/api/paymentPlan", paymentPlanRoutes);
// app.use("/api/dashboard", dashboardRoute);
exports.default = app;
//# sourceMappingURL=app.js.map