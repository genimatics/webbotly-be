import { Schema, Document, model } from "mongoose";

export interface IBooking extends Document {
  userId: string;
  summary: string;
  description: string;
  startTime: Date;
  dev?: boolean;
  endTime: Date;
  meetLink: string;
  eventId: string;
  createdAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    userId: { type: String, required: true }, // e.g., internal user ID or Google ID
    summary: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    meetLink: { type: String, required: true },
    dev: { type: Boolean, default: false },
    eventId: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);


export default model<IBooking>("Booking", BookingSchema);
