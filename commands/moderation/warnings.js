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

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getUser('user');
    const warnDoc = await Warns.findOne({ guildId: interaction.guild.id, userId: target.id });

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.warn_mod} Warnings — ${target.tag}`)
    );

    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

    if (!warnDoc || warnDoc.warnings.length === 0) {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('This member has no warnings.')
      );
    } else {
      warnDoc.warnings.slice(-10).forEach((w, i) => {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**#${i + 1}** \`${w.warnId}\` — ${w.reason}\n› By <@${w.moderatorId}> • <t:${Math.floor(w.at / 1000)}:R>`
          )
        );
      });
    }

    await interaction.editReply({ components: [container], flags: [4096] });
  },
};