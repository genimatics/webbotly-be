"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChat = exports.fetchChats = void 0;
exports.createGoogleMeetEvent = createGoogleMeetEvent;
const mongoose_1 = require("mongoose");
const openai_1 = __importDefault(require("openai"));
const constants_1 = require("../../constants");
const meetCredentials_model_1 = __importDefault(require("../meetCredentials/meetCredentials.model"));
const leads_model_1 = __importDefault(require("../leads/leads.model"));
const chatMessage_model_1 = __importDefault(require("./chatMessage.model"));
const chatSession_model_1 = __importDefault(require("../chatSession/chatSession.model"));
const bookings_model_1 = __importDefault(require("../bookings/bookings.model"));
const content_model_1 = __importDefault(require("../chatbot/content.model"));
const { google } = require("googleapis");
const client = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
const storeLead = async (args) => {
    const session = await (0, constants_1.getChatSession)(args.sessionId, args.chatbotId);
    const dev = !!args?.dev;
    if (!session)
        return {};
    const leads = new leads_model_1.default({
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
const fetchChats = async (userId, noDev) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const querySearch = noDev ? { dev: { $ne: true } } : {};
    const sessionsWithCounts = await chatSession_model_1.default.aggregate([
        {
            $match: {
                userId: new mongoose_1.Types.ObjectId(userId),
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
exports.fetchChats = fetchChats;
async function createGoogleMeetEvent({ summary, description, startTime, userId, email, dev, endTime, }) {
    const creds = await meetCredentials_model_1.default.findOne({ userId });
    if (!creds) {
        throw new Error("Google account not connected.");
    }
    const oauthClient = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, "http://localhost:4000/api/gmeet/google/callback");
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
            await meetCredentials_model_1.default.updateOne({ userId }, {
                $set: {
                    access_token: newTokens.access_token,
                    expiry_date: newTokens.expiry_date,
                },
            });
            oauthClient.setCredentials({
                ...oauthClient.credentials,
                access_token: newTokens.access_token,
                expiry_date: newTokens.expiry_date,
            });
        }
        catch (err) {
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
        const booking = new bookings_model_1.default({
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
    }
    catch (error) {
        console.error("Google Meet creation failed:", error);
        throw new Error("Failed to create Google Meet event.");
    }
}
// Controller function to handle chat messages
// export const handleChat = async (req: ChatRequest, res: Response) => {
//   try {
//     // @ts-ignore
//     const { message, sessionId, chatbotId, dev } = req.body;
//     if (!message) return res.status(400).json({ error: "Message is required" });
//     if (!chatbotId)
//       return res.status(400).json({ error: "Chatbot Id is required" });
//     let additionalPrompt = "";
//     // Get chatbot and personality
//     const { chatbot, personality, userId } = await getChatbot(chatbotId);
//     const chatbotContent = await ContentModel.findOne({ chatbotId })
//     if (!userId)
//       return res.status(400).json({ error: "User Id is required" });
//     if (!chatbotContent)
//       return res.status(400).json({ error: "no context" });
//     const user = await User.findById(userId);
//     // const hasMeetingEnabled = await MeetCredentials.findOne({
//     //   userId,
//     // });
//     // if (hasMeetingEnabled) {
//     //   additionalPrompt = getMeetingPrompt(user, (userId).toString());
//     // }
//     if (!chatbot || !personality)
//       return res.status(400).json({ error: "Invalid chatbot or personality" });
//     // Get or create session
//     const session = await getChatSession(sessionId, chatbotId, dev, (userId).toString());
//     if (!session)
//       return res.status(500).json({ error: "Failed to retrieve session" });
//     // Store user's message
//     await storeUserMessage((session._id).toString(), message, (userId).toString(), dev);
//     // Fetch last 10 messages
//     const recentMessages = await ChatMessage.find({
//       chatSessionId: session._id,
//     })
//       .sort("created_at")
//       .limit(10);
//     // Generate chatbot response
//     const chatbotReply = await getChatbotResponse(
//       chatbot,
//       personality,
//       (session._id).toString(),
//       message,
//       recentMessages || [],
//       (userId).toString(),
//       chatbotContent.content || {},
//       `
//       // 
//        Response Format:
//         json format:
//           { 
//             "message": "Your reply goes here.", 
//           }
//       `,
//       dev
//     );
//     // Store chatbot's response
//     await storeBotMessage((session._id).toString(), chatbotReply || "", (userId).toString(), dev);
//     // Respond with chatbot reply and messages
//     res.json({
//       sessionId: session._id,
//       dev,
//       response: chatbotReply,
//       messages:
//         recentMessages?.map((msg: { role: string; content: string }) => ({
//           role: msg.role,
//           content: msg.content,
//         })) || [],
//     });
//   } catch (error) {
//     console.error("Error handling chat:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while processing the request" });
//   }
// };
const tools = [
    {
        type: "function",
        function: {
            parse: JSON.parse,
            function: storeLead,
            description: "Run this tool, when user provides his name or email or number",
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
                        description: "Email address provided by the user or N/A if not given",
                    },
                    phone: {
                        type: "string",
                        description: "Phone number provided by the user or N/A if not given",
                    },
                    userId: {
                        type: "string",
                        description: "User id of the user",
                    },
                    name: {
                        type: "string",
                        description: "Name of the user, user can provide this, if not, then try email to get the name and if both not then N/A",
                    },
                },
                additionalProperties: false,
            },
        },
    },
];
const handleChat = async (req, res) => {
    try {
        // @ts-ignore
        const { message, sessionId, chatbotId, dev } = req.body;
        if (!message)
            return res.status(400).json({ error: "Message is required" });
        if (!chatbotId)
            return res.status(400).json({ error: "Chatbot Id is required" });
        const { chatbot, personality, userId } = await (0, constants_1.getChatbot)(chatbotId);
        const chatbotContent = await content_model_1.default.findOne({ chatbotId });
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
        const session = await (0, constants_1.getChatSession)(sessionId, chatbotId, dev, (userId).toString());
        if (!session)
            return res.status(500).json({ error: "Failed to retrieve session" });
        res.write(`data: ${JSON.stringify({
            type: "meta",
            sessionId: session._id.toString()
        })}\n\n`);
        const recentMessages = await chatMessage_model_1.default.find({
            chatSessionId: session._id,
        })
            .sort("created_at")
            .limit(25);
        // Store user's message
        await (0, constants_1.storeUserMessage)((session._id).toString(), message, (userId).toString(), dev);
        const stream = client.chat.completions.runTools({
            model: 'gpt-4o-mini',
            messages: [{ content: (0, constants_1.GENI_INITIALIZATION_PROMPT)(JSON.stringify(chatbotContent?.content || {}), personality._id.toString(), session._id.toString(), chatbotId, userId.toString()), role: "assistant" },
                ...recentMessages.map((msg) => ({ role: msg.role, content: msg.content })),
                { content: message, role: 'user' }
            ],
            tools: [...tools],
            stream: true,
        });
        let fullResponse = "";
        for await (const chunk of stream) {
            let content = chunk.choices?.[0]?.delta?.content;
            console.log({ content });
            if (content) {
                try {
                    const parsed = JSON.parse(content);
                    if (parsed.message) {
                        content = parsed.message;
                    }
                }
                catch {
                    // ignore
                }
                fullResponse += content;
                res.write(`data: ${JSON.stringify({
                    type: "chunk",
                    content
                })}\n\n`);
            }
        }
        await (0, constants_1.storeBotMessage)(session._id.toString(), fullResponse, userId.toString(), dev);
        res.write(`data: ${JSON.stringify({
            type: "done"
        })}\n\n`);
        res.end();
    }
    catch (err) { }
};
exports.handleChat = handleChat;
const meetingTool = {
    type: "function",
    function: {
        parse: JSON.parse,
        function: createGoogleMeetEvent,
        description: "Run this tool, when user provides the meeting details to book a meeting",
        name: "createGoogleMeetEvent",
        parameters: {
            type: "object",
            required: [
                "summary",
                "description",
                "startTime",
                "userId",
                "endTime",
                "email",
                "dev",
            ],
            properties: {
                summary: {
                    type: "string",
                    description: "Summary of the meeting",
                },
                description: {
                    type: "string",
                    description: "Description of the meeting",
                },
                email: {
                    type: "string",
                    description: "Email of the user",
                },
                startTime: {
                    type: "string",
                    description: "Start time of the meeting",
                },
                userId: {
                    type: "string",
                    description: "User id of the user already stored in the system",
                },
                endTime: {
                    type: "string",
                    description: "End time of the meeting",
                },
                dev: {
                    type: "boolean",
                    description: "The dev flag provided in the system prompt",
                },
            },
            additionalProperties: false,
        },
    },
};
// Function to get chatbot response from OpenAI
const getChatbotResponse = async (chatbot, personality, sessionId, message, messages, userId, content, responseType, dev) => {
    const tools = [
        {
            type: "function",
            function: {
                parse: JSON.parse,
                function: storeLead,
                description: "Run this tool, when user provides his name or email or number",
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
                            description: "Email address provided by the user or N/A if not given",
                        },
                        phone: {
                            type: "string",
                            description: "Phone number provided by the user or N/A if not given",
                        },
                        userId: {
                            type: "string",
                            description: "User id of the user",
                        },
                        name: {
                            type: "string",
                            description: "Name of the user, user can provide this, if not, then try email to get the name and if both not then N/A",
                        },
                    },
                    additionalProperties: false,
                },
            },
        },
        []
        // ...(!!additionalPrompt ? [meetingTool] : []),
    ];
    const intialPrompt = (0, constants_1.GENI_INITIALIZATION_PROMPT)(JSON.stringify(content), personality.prompt, sessionId, chatbot.id, userId, dev);
    // const prompt = `${intialPrompt}\n\n${!!additionalPrompt ? additionalPrompt : responseType || ""
    //   }`;
    const prompt = intialPrompt;
    // @ts-ignore
    const runner = client.chat.completions.runTools({
        model: "gpt-4o",
        temperature: 0.1,
        response_format: {
            type: "json_object",
        },
        max_tokens: 1000,
        // @ts-ignore
        tools,
        messages: [
            {
                role: "system",
                content: prompt,
            },
            ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
            { role: "user", content: message },
        ],
    });
    return await runner.finalContent();
};
//# sourceMappingURL=chatMessage.controller.js.map