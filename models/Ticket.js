import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  userId: String,
  ticketNumber: Number,
  category: String,
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  claimedBy: { type: String, default: null },
  transcript: [{ author: String, content: String, at: Date }],
  openedAt: { type: Date, default: Date.now },
  closedAt: Date,
});

export default mongoose.model('Ticket', ticketSchema);