import mongoose from 'mongoose';

const giveawaySchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  messageId: String,
  hostId: String,
  prize: String,
  winnerCount: { type: Number, default: 1 },
  participants: [String],
  winners: [String],
  endsAt: Date,
  ended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Giveaway', giveawaySchema);