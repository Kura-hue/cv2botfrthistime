import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  username: String,
  reputation: { type: Number, default: 0 },
  repCooldown: { type: Date, default: null },
  repGiven: [{ to: String, at: Date }],
  marriedTo: { type: String, default: null },
  marriageDate: { type: Date, default: null },
  pendingProposal: { type: String, default: null },
  children: [{ userId: String, adoptedAt: Date }],
  createdAt: { type: Date, default: Date.now },
});

userSchema.index({ userId: 1, guildId: 1 }, { unique: true });
export default mongoose.model('User', userSchema);