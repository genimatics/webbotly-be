import mongoose, { Schema, Document, model } from "mongoose";

export interface IChatbot extends Document {
  name: string;
  initialMessage: string;
  content?: Record<string, any>;
  theme?: Record<string, any>;
  personalityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotSchema: Schema<IChatbot> = new Schema(
  {
    name: { type: String, required: true },
    content: { type: Object, default: {} }, // Default empty object
    initialMessage: { type: String, default: "" },
    theme: { type: Object, default: {} },
    personalityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatbotPersonality",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);


export default model<IChatbot>("Chatbot", ChatbotSchema);
