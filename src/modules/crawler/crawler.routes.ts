import { Router } from "express";
import * as crawlerController from "./crawler.controller";
import { authenticate } from "../../middleware";

const router = Router();

router.get("/pages", authenticate, crawlerController.crawlWebsite);
router.get("/fetch", authenticate, crawlerController.getCrawledWebsitePages);

export default router;