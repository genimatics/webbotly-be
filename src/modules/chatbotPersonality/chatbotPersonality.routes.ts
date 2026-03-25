import { Response, Request } from "express";

const express = require("express");
import ChatbotPersonality from '../chatbotPersonality/chatbotPersonality.model'; // Import User model
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { personality, avatar, name, description, prompt, suitedFor } =
    req.body;
  try {
    const newPersonality = new ChatbotPersonality({
      personality,
      avatar,
      name,
      description,
      prompt,
      suitedFor,
    });
    await newPersonality.save();

    res
      .status(201)
      .json({ message: "New Chatbot Personality Created", newPersonality });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update an existing chatbot personality
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updatedPersonality = await ChatbotPersonality.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!updatedPersonality) {
      return res.status(404).json({ message: "Chatbot Personality not found" });
    }

    res.json({ message: "Chatbot Personality Updated", updatedPersonality });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const personalities = await ChatbotPersonality.find({ active: true });
    res.json(personalities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/all", async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input format, expected an array",
      });
    }

    const insertedPersonalities = [];
    for (const item of data) {
      const newPersonality = new ChatbotPersonality(item);
      await newPersonality.save();
      insertedPersonalities.push(newPersonality);
    }

    res.status(201).json({ success: true, data: insertedPersonalities });
  } catch (error) {
    // @ts-ignore
    res.status(400).json({ success: false, message: error.message });
  }
});
export default router;
