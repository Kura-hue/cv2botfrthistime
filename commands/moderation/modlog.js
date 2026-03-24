import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from 'discord.js';
import { e } from '../../utils/emojis.js';
import ModLog from '../../models/ModLog.js';

export default {
  data: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription('View moderation history for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('user').setDescription('User').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getUser('user');
    const logs = await ModLog.find({ guildId: interaction.guild.id, targetId: target.id })
      .sort({ caseNumber: -1 })
      .limit(10);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.warn_mod} Modlogs — ${target.tag}`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

    if (logs.length === 0) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent('No moderation history found.'));
    } else {
      logs.forEach((log) => {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Case #${log.caseNumber}** — \`${log.type}\`\n› ${log.reason} | By <@${log.moderatorId}> | <t:${Math.floor(new Date(log.at).getTime() / 1000)}:R>`
          )
        );
      });
    }

    await interaction.editReply({ components: [container], flags: [4096] });
  },
};