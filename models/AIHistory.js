import mongoose from 'mongoose';

const aiHistorySchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  history: [
    {
      role: { type: String, enum: ['user', 'assistant'] },
      content: String,
      at: { type: Date, default: Date.now },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

aiHistorySchema.index({ userId: 1, guildId: 1 });
export default mongoose.model('AIHistory', aiHistorySchema);