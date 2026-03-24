import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';
import Warns from '../../models/Warns.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear all warnings for a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getUser('user');
    await Warns.deleteOne({ guildId: interaction.guild.id, userId: target.id });

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${e.check} Cleared all warnings for **${target.tag}**.`)
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};