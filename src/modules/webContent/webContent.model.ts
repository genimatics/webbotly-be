import mongoose, { Schema, Document } from 'mongoose';

interface IContent extends Document {
  user_id: mongoose.Types.ObjectId;
  content: Record<string, any>;
  isActive: boolean;
  isDeleted: boolean;
}

const ContentSchema: Schema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model("Content",ContentSchema);