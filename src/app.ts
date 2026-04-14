import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { setupSwagger } from "./config/swagger";
import userRoutes from "./modules/user/user.routes";
import webContentRoutes from "./modules/webContent/webContent.routes"
import chatbotRoutes from "./modules/chatbot/chatbot.routes"
import chatbotPersonalityRoutes from "./modules/chatbotPersonality/chatbotPersonality.routes"
import chatbotMessageRoutes from "./modules/chatMessage/chatMessage.routes"
import crawlerRoutes from "./modules/crawler/crawler.routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();



app.use(
    cors({
        origin: '*',
    })
);

setupSwagger(app);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/crawler", crawlerRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/content", webContentRoutes);
app.use("/api/chatbotPersonality", chatbotPersonalityRoutes);
app.use("/api/chatbotMessage", chatbotMessageRoutes);

export default app;