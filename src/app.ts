import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { setupSwagger } from "./config/swagger";
import userRoutes from "./modules/user/user.routes";
import crawlerRoutes from "./modules/crawler/crawler.routes";
import chatbotRoutes from "./modules/chatbot/chatbot.routes"
import dotenv from "dotenv";


const app = express();


app.use(
    cors({
        origin: ['http://localhost:3000','https://dome-fe.vercel.app'],
        credentials: true,
    })
);

dotenv.config();
setupSwagger(app);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/crawler", crawlerRoutes);
app.use("/api/chatbot", chatbotRoutes);
// app.use("/api/sites", siteRoutes);
// app.use("/api/documents", documentsRoutes);
// app.use('/api/assets', assetRoutes);

export default app;