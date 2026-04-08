import mongoose, { Schema, Document, model } from "mongoose";

export interface IChatbotContent extends Document {
  content?: Record<string, any>;
  chatbotId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotContentSchema: Schema<IChatbotContent> = new Schema(
  {
    content: { type: Object, default: {} }, // Default empty object
    chatbotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatbot",
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


export default model<IChatbotContent>("ChatbotContent", ChatbotContentSchema);
