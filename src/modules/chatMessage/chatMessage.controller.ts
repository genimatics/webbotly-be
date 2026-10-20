import { Request, Response } from "express";
import { Types } from 'mongoose'
import OpenAI from "openai";
import { CreateGoogleMeetParams, GENI_INITIALIZATION_PROMPT, getChatbot, getChatSession, storeBotMessage, storeUserMessage } from "../../constants";
import MeetCredentials from "../meetCredentials/meetCredentials.model"
import Leads from "../leads/leads.model"
import ChatMessage from "./chatMessage.model"
import ChatSession from "../chatSession/chatSession.model"
import Booking from "../bookings/bookings.model"
import ContentModel from "../chatbot/content.model";
const { google } = require("googleapis");


const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const storeLead = async (args: any) => {
  const session = await getChatSession(args.sessionId, args.chatbotId);
  const dev = !!args?.dev;

  if (!session) return {};

  const leads = new Leads({
    meta: {
      email: args.email,
      name: args.name,
      phone: args.phone,
    },
    dev,
    chatSessionId: args.sessionId,
    chatbotId: args.chatbotId,
    userId: session.userId,
  });

  await leads.save();
  return {};
};

export const fetchChats = async (userId: string, noDev?: boolean) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const querySearch = noDev ? { dev: { $ne: true } } : {};

  const sessionsWithCounts = await ChatSession.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        ...querySearch,
      },
    },
    {
      $lookup: {
        from: "chatmessages",
        localField: "_id",
        foreignField: "chatSessionId",
        as: "messages",
      },
    },
    {
      $addFields: {
        messageCount: { $size: "$messages" },
      },
    },
    {
      $project: {
        messages: 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return sessionsWithCounts;
};


export async function createGoogleMeetEvent({
  summary,
  description,
  startTime,
  userId,
  email,
  dev,
  endTime,
}: CreateGoogleMeetParams) {
  const creds = await MeetCredentials.findOne({ userId });

  if (!creds) {
    throw new Error("Google account not connected.");
  }

  const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BACKEND_URL}/api/gmeet/google/callback`
  );

  oauthClient.setCredentials({
    access_token: creds.access_token,
    expiry_date: creds.expiry_date,
    refresh_token: creds.refresh_token,
    scope: creds.scope,
    token_type: creds.token_type,
  });

  // Check if token is expired or about to expire
  const isExpired = !creds.expiry_date || creds.expiry_date <= Date.now();

  if (isExpired) {
    try {
      const tokens = await oauthClient.refreshAccessToken(); // deprecated but still works
      const newTokens = tokens.credentials;

      // Update DB with new access token
      await MeetCredentials.updateOne(
        { userId },
        {
          $set: {
            access_token: newTokens.access_token,
            expiry_date: newTokens.expiry_date,
          },
        }
      );

      oauthClient.setCredentials({
        ...oauthClient.credentials,
        access_token: newTokens.access_token,
        expiry_date: newTokens.expiry_date,
      });
    } catch (err) {
      console.error("Failed to refresh token:", err);
      throw new Error("Session expired. Please reconnect your Google account.");
    }
  }

  const calendar = google.calendar({ version: "v3", auth: oauthClient });

  try {
    const result = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        description,
        attendees: [{ email }],
        start: { dateTime: startTime },
        end: { dateTime: endTime },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    const booking = new Booking({
      userId,
      summary,
      dev,
      description,
      startTime,
      endTime,
      eventId: result.data?.id,
      meetLink: result.data?.hangoutLink,
    });

    await booking.save();
    return {
      result,
    };
  } catch (error) {
    console.error("Google Meet creation failed:", error);
    throw new Error("Failed to create Google Meet event.");
  }
}

interface ChatRequest extends Request {
  body: {
    message: string;
    sessionId?: string;
    chatbotId: string;
  };
}

const tools: any[] = [
  {
    type: "function",
    function: {
      parse: JSON.parse,
      function: storeLead,
      description:
        "Run this tool, when user provides his name or email or number",
      name: "storeLead",

      parameters: {
        type: "object",
        required: ["sessionId", "chatbotId", "email", "phone", "name", "dev"],
        properties: {
          sessionId: {
            type: "string",
            description: "The sessionId provided in the system prompt",
          },
          dev: {
            type: "boolean",
            description: "The dev flag provided in the system prompt",
          },
          chatbotId: {
            type: "string",
            description: "The chatbotId provided in the system prompt",
          },
          email: {
            type: "string",
            description:
              "Email address provided by the user or N/A if not given",
          },
          phone: {
            type: "string",
            description:
              "Phone number provided by the user or N/A if not given",
          },
          userId: {
            type: "string",
            description: "User id of the user",
          },
          name: {
            type: "string",
            description:
              "Name of the user, user can provide this, if not, then try email to get the name and if both not then N/A",
          },
        },
        additionalProperties: false,
      },
    },
  },
];

export const handleChat = async (req: ChatRequest, res: Response) => {
  try {
    // @ts-ignore
    const { message, sessionId, chatbotId, dev } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!chatbotId)
      return res.status(400).json({ error: "Chatbot Id is required" });

    const { chatbot, personality, userId } = await getChatbot(chatbotId);
    const chatbotContent = await ContentModel.findOne({ chatbotId })



    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!userId)
      return res.status(400).json({ error: "User Id is required" });

    if (!chatbotContent)
      return res.status(400).json({ error: "no context" });

    if (!chatbot || !personality)
      return res.status(400).json({ error: "Invalid chatbot or personality" });

    // Get or create session
    const session = await getChatSession(sessionId, chatbotId, dev, (userId).toString());

    if (!session)
      return res.status(500).json({ error: "Failed to retrieve session" });

    res.write(`data: ${JSON.stringify({
      type: "meta",
      sessionId: session._id.toString()
    })}\n\n`);

    const recentMessages = await ChatMessage.find({
      chatSessionId: session._id,
    })
      .sort("created_at")
      .limit(25);
    // Store user's message
    await storeUserMessage((session._id).toString(), message, (userId).toString(), dev);




    const stream = client.chat.completions.runTools({
      model: 'gpt-4o-mini',
      messages: [{ content: GENI_INITIALIZATION_PROMPT(JSON.stringify(chatbotContent?.content || {}), personality._id.toString(), session._id.toString(), chatbotId, userId.toString()), role: "assistant" },
      ...recentMessages.map((msg) => ({ role: msg.role, content: msg.content })),
      { content: message, role: 'user' }
      ],
      tools: [...tools],
      stream: true,
    })
    let fullResponse = "";
    for await (const chunk of stream) {
      let content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.message) {
            content = parsed.message;
          }
        } catch {
        }
        fullResponse += content;

        res.write(`data: ${JSON.stringify({
          type: "chunk",
          content
        })}\n\n`);
      }
    }
    await storeBotMessage(
      session._id.toString(),
      fullResponse,
      userId.toString(),
      dev
    );

    res.write(`data: ${JSON.stringify({
      type: "done"
    })}\n\n`);

    res.end();
  } catch {
  }
}