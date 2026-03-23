import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  chatSessionId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  userId: mongoose.Types.ObjectId;
  content: string;
  completionTokens?: number;
  promptTokens?: number;
  createdAt: Date;
  dev?: boolean;
  updatedAt: Date;
}

const ChatMessageSchema: Schema<IChatMessage> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
    },
    role: { type: String, enum: ["user", "assistant"], required: true },
    dev: { type: Boolean },
    content: { type: String, required: true },
    completionTokens: { type: Number },
    promptTokens: { type: Number },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
