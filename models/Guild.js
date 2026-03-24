import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' },
  modLogChannel: String,
  ticketCategory: String,
  ticketLogChannel: String,
  ticketCounter: { type: Number, default: 0 },
  welcomeChannel: String,
  welcomeMessage: String,
  muteRole: String,
  autoRoles: [String],
  disabledCommands: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Guild', guildSchema);