import mongoose, { Schema, Document, model } from "mongoose";

export interface IChatSession extends Document {
  chatbotId: mongoose.Types.ObjectId;
  active: boolean;
  startedAt: Date;
  endedAt?: Date;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  dev: boolean
}

const ChatSessionSchema: Schema<IChatSession> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatbotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatbot",
      required: true,
    },
    active: { type: Boolean, default: true },
    dev: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

export default model<IChatSession>("ChatSession", ChatSessionSchema);

