import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  chatSessionId: mongoose.Types.ObjectId;
  chatbotId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  dev?: boolean;
  active: boolean;
  startedAt: Date;
  endedAt?: Date;
  meta: {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any; // Allow additional dynamic fields
  };
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema<ILead> = new Schema(
  {
    chatSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dev: { type: Boolean, default: false },
    chatbotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatbot",
      required: true,
    },
    active: { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    meta: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);
module.exports = mongoose.model("Lead", LeadSchema);
