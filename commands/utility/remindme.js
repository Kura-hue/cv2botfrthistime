import { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';
import ms from 'ms';
import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId: String, channelId: String, guildId: String,
  message: String, remindAt: Date, createdAt: { type: Date, default: Date.now },
});
export const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);

export default {
  data: new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Set a reminder')
    .addStringOption((o) => o.setName('time').setDescription('Time (e.g. 10m, 2h, 1d)').setRequired(true))
    .addStringOption((o) => o.setName('message').setDescription('Reminder message').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const time = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const duration = ms(time);

    if (!duration) return interaction.editReply({ content: `${e.cross} Invalid time format. Try \`10m\`, \`2h\`, \`1d\`.` });

    const remindAt = new Date(Date.now() + duration);
    await Reminder.create({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
      guildId: interaction.guild.id,
      message,
      remindAt,
    });

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.check} **Reminder set!**\nI'll remind you <t:${Math.floor(remindAt / 1000)}:R>.\n**Message:** ${message}`
      )
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};