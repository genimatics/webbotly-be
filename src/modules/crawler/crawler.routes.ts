import { Router } from "express";
import * as crawlerController from "./crawler.controller";

const router = Router();

router.get("/", crawlerController.crawlWebsite);

export default router;