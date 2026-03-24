import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((o) => o.setName('userid').setDescription('User ID to unban').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.members.unban(userId, reason);
      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${e.check} User \`${userId}\` has been unbanned.\n**Reason:** ${reason}`)
      );
      await interaction.editReply({ components: [container], flags: [4096] });
    } catch {
      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${e.cross} Could not unban that user. Check the ID.`)
      );
      await interaction.editReply({ components: [container], flags: [4096] });
    }
  },
};