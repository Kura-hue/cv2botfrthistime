import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from 'discord.js';
import { e } from '../../utils/emojis.js';
import Warns from '../../models/Warns.js';
import { randomUUID } from 'crypto';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('user').setDescription('Member to warn').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const warnId = randomUUID().split('-')[0].toUpperCase();

    let warnDoc = await Warns.findOne({ guildId: interaction.guild.id, userId: target.id });
    if (!warnDoc) {
      warnDoc = new Warns({ guildId: interaction.guild.id, userId: target.id, warnings: [] });
    }
    warnDoc.warnings.push({ warnId, moderatorId: interaction.user.id, reason });
    await warnDoc.save();

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.warn_mod} Warning Issued`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**User:** <@${target.id}>\n**Warn ID:** \`${warnId}\`\n**Reason:** ${reason}\n**Total Warnings:** ${warnDoc.warnings.length}`
        )
      );

    await interaction.editReply({ components: [container], flags: [4096] });
  },
};