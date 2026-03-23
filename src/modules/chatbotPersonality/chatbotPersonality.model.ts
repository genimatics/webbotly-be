import mongoose, { Schema, Document, model } from "mongoose";

interface ISuitedFor {
  label: string;
  isActive: boolean;
}

export interface IChatbotPersonality extends Document {
  personality: string;
  avatar: string;
  name: string;
  description?: string;
  prompt: string;
  suitedFor: ISuitedFor[];
  active: boolean;
  createdAt: Date;
  is_premium: boolean;
  updatedAt: Date;
}

const ChatbotPersonalitySchema: Schema<IChatbotPersonality> = new Schema(
  {
    personality: { type: String, required: true },
    avatar: { type: String, required: true },
    name: { type: String, required: true },
    is_premium: {type: Boolean, required: false},
    description: { type: String },
    prompt: { type: String, required: true },
    suitedFor: [
      {
        label: { type: String, required: true },
        isActive: { type: Boolean, default: false },
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

export default model<IChatbotPersonality>("ChatbotPersonality", ChatbotPersonalitySchema);
