import { Request, Response, Router } from "express";
import { authenticate } from "../../middleware";
import ChatMessage from "./chatMessage.model"
import { fetchChats, handleChat } from "./chatMessage.controller";


const router = Router();

router.post("/", handleChat);

router.get("/history", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // safest if user is not typed
    if (!userId) res.status(401).json({ error: "Unauthorized" });

    const sessionsWithCounts = await fetchChats(userId);

    res.status(200).json(sessionsWithCounts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/history", async (req: Request, res: Response) => {
  const { sessionId } = req.body || {};
  const messages = await ChatMessage.find({ chatSessionId: sessionId });

  res.status(200).json(messages);
});

export default router;
