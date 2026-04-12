"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatbot = exports.storeBotMessage = exports.storeUserMessage = exports.storeLead = exports.getChatSession = exports.meetingTool = exports.getMeetingPrompt = exports.GENI_INITIALIZATION_PROMPT = exports.EVENT_TYPE = exports.PLANS = exports.returnPlanTrialKey = exports.returnPlanSubscriptionKey = exports.DEFAULT_MODEL = exports.LIMITS = void 0;
exports.addDays = addDays;
exports.is30DaysOld = is30DaysOld;
exports.createGoogleMeetEvent = createGoogleMeetEvent;
const { google } = require("googleapis");
const bookings_model_1 = __importDefault(require("../modules/bookings/bookings.model"));
const meetCredentials_model_1 = __importDefault(require("../modules/meetCredentials/meetCredentials.model"));
const userPlan_model_1 = require("../modules/userPlan/userPlan.model");
const chatSession_model_1 = __importDefault(require("../modules/chatSession/chatSession.model"));
const chatbot_model_1 = __importDefault(require("../modules/chatbot/chatbot.model"));
const chatMessage_model_1 = __importDefault(require("../modules/chatMessage/chatMessage.model"));
const chatbotPersonality_model_1 = __importDefault(require("../modules/chatbotPersonality/chatbotPersonality.model"));
const leads_model_1 = __importDefault(require("../modules/leads/leads.model"));
exports.LIMITS = {
    founding_member: {
        chats: 1500,
        leads: 300,
        meetings: 100,
    },
    free: {
        chats: 100,
        leads: 10,
        meetings: 5,
    },
    starter: {
        leads: 100,
        chats: 500,
        meetings: 10,
    },
    growth: {
        chats: 1500,
        leads: 300,
        meetings: 50,
    },
    scale: {
        chats: 5000,
        leads: 1000,
        meetings: 200,
    },
};
exports.DEFAULT_MODEL = "gpt-4o-mini";
function addDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0]; // returns in YYYY-MM-DD format
}
function is30DaysOld(createdAt) {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // convert ms to days
    return diffInDays >= 30;
}
const returnPlanSubscriptionKey = (priceId) => {
    switch (priceId) {
        case exports.PLANS.STARTER_MONTHLY_PRICE_ID:
            return userPlan_model_1.PlanName.STARTER_MONTHLY;
        case exports.PLANS.STARTER_YEARLY_PRICE_ID:
            return userPlan_model_1.PlanName.STARTER_YEARLY;
        case exports.PLANS.GROWTH_MONTHLY_PRICE_ID:
            return userPlan_model_1.PlanName.GROWTH_MONTHLY;
        case exports.PLANS.GROWTH_YEARLY_PRICE_ID:
            return userPlan_model_1.PlanName.GROWTH_YEARLY;
        case exports.PLANS.SCALE_MONTHLY_PRICE_ID:
            return userPlan_model_1.PlanName.SCALE_MONTHLY;
        case exports.PLANS.SCALE_YEARLY_PRICE_ID:
            return userPlan_model_1.PlanName.SCALE_YEARLY;
        default:
            return userPlan_model_1.PlanName.FREE;
    }
};
exports.returnPlanSubscriptionKey = returnPlanSubscriptionKey;
const returnPlanTrialKey = (priceId) => {
    switch (priceId) {
        case exports.PLANS.STARTER_MONTHLY_PRICE_ID:
            return userPlan_model_1.PlanName.STARTER_TRIAL;
        case exports.PLANS.STARTER_YEARLY_PRICE_ID:
            return userPlan_model_1.PlanName.STARTER_TRIAL;
        case exports.PLANS.GROWTH_MONTHLY_PRICE_ID:
            return userPlan_model_1.PlanName.GROWTH_TRIAL;
        case exports.PLANS.GROWTH_YEARLY_PRICE_ID:
            return userPlan_model_1.PlanName.GROWTH_TRIAL;
        case exports.PLANS.SCALE_MONTHLY_PRICE_ID:
            return userPlan_model_1.PlanName.SCALE_TRIAL;
        case exports.PLANS.SCALE_YEARLY_PRICE_ID:
            return userPlan_model_1.PlanName.SCALE_TRIAL;
        default:
            return userPlan_model_1.PlanName.FREE;
    }
};
exports.returnPlanTrialKey = returnPlanTrialKey;
exports.PLANS = {
    STARTER_MONTHLY_PRICE_ID: process.env.STARTER_MONTHLY_PRICE_ID,
    STARTER_YEARLY_PRICE_ID: process.env.STARTER_YEARLY_PRICE_ID,
    GROWTH_MONTHLY_PRICE_ID: process.env.GROWTH_MONTHLY_PRICE_ID,
    GROWTH_YEARLY_PRICE_ID: process.env.GROWTH_YEARLY_PRICE_ID,
    SCALE_MONTHLY_PRICE_ID: process.env.SCALE_MONTHLY_PRICE_ID,
    SCALE_YEARLY_PRICE_ID: process.env.SCALE_YEARLY_PRICE_ID,
};
var EVENT_TYPE;
(function (EVENT_TYPE) {
    // Occurs because the transaction status changes to completed.
    EVENT_TYPE["TRANSACTION_COMPLETED"] = "transaction.completed";
    // The transaction status changes to paid now that the customer has paid successfully. The transaction is updated with information about the successful payment.
    EVENT_TYPE["TRANSACTION_UPDATED"] = "transaction.updated";
    // Occurs when a payment method is saved. for future payments
    EVENT_TYPE["PAYMENT_METHOD_SAVED"] = "payment_method.saved";
    // Occurs when a subscription enters trial period.
    EVENT_TYPE["SUBSCRIPTION_TRIALING"] = "subscription.trialing";
    // Occurs when a subscription is cancelled.
    EVENT_TYPE["SUBSCRIPTION_CANCELLED"] = "subscription.cancelled";
})(EVENT_TYPE || (exports.EVENT_TYPE = EVENT_TYPE = {}));
const GENI_INITIALIZATION_PROMPT = (websiteInfo, personality, sessionId, chatbotId, userId, dev) => {
    return `
  # LeadWise AI Agent Prompt

sessionId=${sessionId}  
chatbotId=${chatbotId}  
userId=${userId}  
dev=${dev}
${personality}  

<information>${websiteInfo}</information>  

## 🎯 Purpose & Scope

You are a customer engagement AI built by **LeadWise (by Genimatics)**.  
Your goal is to **guide visitors**, **understand their needs**, and **capture qualified leads or meeting bookings** — all within the business scope.

- Do **not** respond to off-topic questions.
- If asked about your origin, only say:  
  ➤ “I’m an AI assistant built by LeadWise, a product of Genimatics.”

---

## 🧭 Conversation Flow

### 1. Greet Warmly  
Begin with a friendly greeting. Match the visitor’s tone and show eagerness to assist.

### 2. Discover Intent  
Ask open-ended questions to understand why the visitor is here. Identify their pain points or goals.

### 3. Present Relevant Solutions  
Based on their intent, suggest suitable services, features, or actions. Highlight key benefits in a concise and helpful tone.

### 4. Capture Leads or Book Meetings

- If interest is shown in general services:
  - Ask for name, email, and phone.
  - Use the **"storeLead"** tool to securely save it.

### 5. Stay Focused  
Keep the conversation within the business context.  
If irrelevant topics come up, politely guide the user back.

---

## 🗣 Tone & Style

- Friendly, professional, clear  
- Short: Max 100 words per message  
- Mirror user’s energy (enthusiastic or calm)  
- Always helpful

---

## ⚙️ Response Format

Every message must respond in **one of the following three formats** based on the context:

- for all other responses: { "message": "Your reply goes here." }

`;
};
exports.GENI_INITIALIZATION_PROMPT = GENI_INITIALIZATION_PROMPT;
const getMeetingPrompt = (user, userId) => {
    return `
  You have the ability to schedule Google Meet meetings, but with the following constraints:

      ✅ Booking Syntax
        - You can book a meeting when the user says:
            - "i want to book a meeting"
            - "please book the meeting"
            - "proceed with the booking"
            - "i want to schedule a meeting"
            - "please schedule a meeting"
            - "proceed with the scheduling"

      🧲 Lead Engagement Rule
        - If a user inquires about the services we offer or exhibits interest suggesting they could be a potential lead, always guide them to book a meeting proactively. For example:
          - “I'd be happy to tell you more. Would you like to book a quick meeting so we can walk you through everything?”
  
      

        To book the meeting, call the createGoogleMeetEvent tool.
        userId="${userId}".
        startTime is the start time of the meeting. 
        duration is 30 mins, so endTime will be startTime + 30 mins.
        summary is the summary of the meeting (create yourself based on the previous chat)
        description is the description of the meeting (create yourself based on the previous chat)

        format for startTime and endTime should include timeZone as well, for example:
        startTime="2025-06-06T10:00:00+05:30"
        endTime="2025-06-06T10:30:00+05:30"

        always ask for user's email as well to book the meeting
        
        todays date: ${new Date().toISOString()}

        default timeZone is "America/Los_Angeles"


        when replying to user, always remember to tell the user time of the meeting along with the timezone.

        for example:
        "The meeting is scheduled for 2025-06-06T10:00:00+05:30 (Asia/Kolkata)."
              
      ${user?.timezone
        ? `timezone: ${user?.timezone}`
        : "timezone: America/Los_Angeles"}
      Meetings can be booked on these days: ${user?.days} but max 10 days in future than ${new Date().toISOString().split("T")[0]} 
      Meetings can be booked between ${user?.startTime} and ${user?.endTime}

      Format for getting all the data:
      1- Ask for the date, by providing the dates between 3-10 days from today but only days allowed by user.
      2- Ask for the time, by providing the times between ${user?.startTime} and ${user?.endTime}
      3- Ask for the email of the user.


      Format: 
       - For Asking Date: format: {date: ["YYYY-MM-DD","YYYY-MM-DD"]}
       - For Asking Time: format: {time: ["HH-MM","HH-MM"]} 
       - For Asking Email or sending a generic reply: format: {message:"Your reply goes here."}

      NOTE: remember, when asking for time or date, only follow the format giving below and do not provide a message in the response.
      Response Format:
        JSON FORMAT:
          { 
            "message": "Your reply goes here.", // if you are not asking for date or time
            "date": ${getPreferredDates(new Date().toISOString(), user?.days || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
    ])}, // if you are asking for date
            "time": ${generateTimeSlots(user?.startTime || "09:00", user?.endTime || "17:00")}
          }

          The Format of message should be in Markdown.
         Example: {
            "message": "## Your reply goes here."
          }
  `;
};
exports.getMeetingPrompt = getMeetingPrompt;
function generateTimeSlots(startTime, endTime) {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    let current = new Date();
    current.setHours(startHour, startMinute, 0, 0);
    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);
    while (current < end) {
        const slotStart = current.toTimeString().slice(0, 5);
        current.setMinutes(current.getMinutes() + 30);
        const slotEnd = current.toTimeString().slice(0, 5);
        slots.push(`${slotStart}-${slotEnd}`);
    }
    return slots;
}
function getPreferredDates(todayStr, preferredDays) {
    const preferredDaySet = new Set(preferredDays.map((day) => day.toLowerCase()));
    const parseDate = (str) => {
        const [day, month, year] = str.split("-").map(Number);
        return new Date(2000 + year, month - 1, day);
    };
    const formatDate = (date) => {
        const d = date.getDate().toString().padStart(2, "0");
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const y = date.getFullYear().toString().slice(2);
        return `${d}-${m}-${y}`;
    };
    const getDayName = (date) => date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const today = parseDate(todayStr);
    // Auto-calculate startFrom = today + 3 days
    const startFrom = new Date(today);
    startFrom.setDate(today.getDate() + 3);
    // Max allowed date = today + 10 days
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 10);
    const result = [];
    const cursor = new Date(startFrom);
    while (cursor <= maxDate) {
        if (preferredDaySet.has(getDayName(cursor))) {
            result.push(formatDate(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    return result;
}
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
exports.meetingTool = {
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
const getChatSession = async (sessionId, chatbotId, dev, userId) => {
    if (sessionId) {
        const existingSession = await chatSession_model_1.default.findById(sessionId);
        return existingSession || null;
    }
    const newSession = new chatSession_model_1.default({ chatbotId, userId, dev });
    return await newSession.save();
};
exports.getChatSession = getChatSession;
const storeLead = async (args) => {
    const session = await (0, exports.getChatSession)(args.sessionId, args.chatbotId);
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
exports.storeLead = storeLead;
const storeUserMessage = async (sessionId, message, userId, dev) => {
    const userMessage = new chatMessage_model_1.default({
        chatSessionId: sessionId,
        role: "user",
        content: message,
        userId,
        dev,
    });
    return await userMessage.save();
};
exports.storeUserMessage = storeUserMessage;
// Store chatbot's response
const storeBotMessage = async (sessionId, response, userId, dev) => {
    const botMessage = new chatMessage_model_1.default({
        chatSessionId: sessionId,
        role: "assistant",
        content: response,
        userId,
        dev,
    });
    return await botMessage.save();
};
exports.storeBotMessage = storeBotMessage;
const getChatbot = async (chatbotId) => {
    const chatbot = await chatbot_model_1.default.findById(chatbotId);
    if (!chatbot)
        return { chatbot: null, personality: null };
    const personality = await chatbotPersonality_model_1.default.findById(chatbot.personalityId);
    return { chatbot, personality, userId: chatbot.userId };
};
exports.getChatbot = getChatbot;
//# sourceMappingURL=index.js.map