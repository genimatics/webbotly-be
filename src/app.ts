import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { setupSwagger } from "./config/swagger";
// import assetRoutes from './modules/asset/asset.routes';
// import clientRoutes from "./modules/client/client.routes";
// import siteRoutes from "./modules/site/site.routes";
import userRoutes from "./modules/user/user.routes";
// import documentsRoutes from "./modules/documents/document.routes";
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
// app.use("/api/clients", clientRoutes);
// app.use("/api/sites", siteRoutes);
// app.use("/api/documents", documentsRoutes);
// app.use('/api/assets', assetRoutes);

export default app;