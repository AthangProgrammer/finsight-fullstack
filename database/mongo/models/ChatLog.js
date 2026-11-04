import mongoose from 'mongoose';

export const CHAT_SOURCES = ['groq', 'fallback'];

const chatLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    questionChars: { type: Number, required: true, min: 1, max: 300 },
    latencyMs: { type: Number, required: true, min: 0 },
    source: { type: String, required: true, enum: CHAT_SOURCES },
    model: { type: String, required: true, maxlength: 80 },
  },
  { collection: 'chat_logs', timestamps: { createdAt: true, updatedAt: false } },
);

chatLogSchema.index({ createdAt: 1 });

export const ChatLog = mongoose.models.ChatLog ?? mongoose.model('ChatLog', chatLogSchema);
