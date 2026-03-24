import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from 'discord.js';
import { e } from '../../utils/emojis.js';
import ms from 'ms';

export default {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('user').setDescription('Member to timeout').setRequired(true))
    .addStringOption((o) =>
      o.setName('duration').setDescription('Duration (e.g. 10m, 1h, 1d)').setRequired(true)
    )
    .addStringOption((o) => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getMember('user');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const durationMs = ms(duration);
    if (!durationMs || durationMs > 2_419_200_000) {
      return interaction.editReply({ content: `${e.cross} Invalid duration. Max is 28 days.` });
    }

    if (!target?.moderatable) {
      return interaction.editReply({ content: `${e.cross} I cannot timeout this member.` });
    }

    await target.timeout(durationMs, reason);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.mute} Member Timed Out`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**User:** ${target.user.tag}\n**Duration:** ${duration}\n**Reason:** ${reason}\n**Expires:** <t:${Math.floor((Date.now() + durationMs) / 1000)}:R>`
        )
      );

    await interaction.editReply({ components: [container], flags: [4096] });
  },
};