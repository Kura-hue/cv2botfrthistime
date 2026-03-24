import { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Get information about a role')
    .addRoleOption((o) => o.setName('role').setDescription('Role').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const role = interaction.options.getRole('role');
    const hexColor = role.hexColor;

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.info} Role — ${role.name}`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**ID:** \`${role.id}\`\n**Color:** \`${hexColor}\`\n**Position:** ${role.position}\n**Members:** ${role.members.size}\n**Mentionable:** ${role.mentionable ? 'Yes' : 'No'}\n**Hoisted:** ${role.hoist ? 'Yes' : 'No'}\n**Managed:** ${role.managed ? 'Yes' : 'No'}\n**Created:** <t:${Math.floor(role.createdTimestamp / 1000)}:R>`
        )
      );

    await interaction.editReply({ components: [container], flags: [4096] });
  },
};