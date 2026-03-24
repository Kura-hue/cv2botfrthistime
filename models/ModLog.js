import mongoose from 'mongoose';

const modLogSchema = new mongoose.Schema({
  guildId: String,
  caseNumber: Number,
  type: String,
  targetId: String,
  targetTag: String,
  moderatorId: String,
  moderatorTag: String,
  reason: String,
  duration: String,
  at: { type: Date, default: Date.now },
});

modLogSchema.index({ guildId: 1, caseNumber: 1 });
export default mongoose.model('ModLog', modLogSchema);