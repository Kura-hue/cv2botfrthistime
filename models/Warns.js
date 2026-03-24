import mongoose from 'mongoose';

const warnSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  warnings: [
    {
      warnId: String,
      moderatorId: String,
      reason: String,
      at: { type: Date, default: Date.now },
    },
  ],
});

warnSchema.index({ guildId: 1, userId: 1 });
export default mongoose.model('Warns', warnSchema);