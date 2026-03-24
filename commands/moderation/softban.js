import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban and immediately unban to delete messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) => o.setName('user').setDescription('User to softban').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Softban — message cleanup';

    if (!target?.bannable) {
      return interaction.editReply({ content: `${e.cross} Cannot softban this member.` });
    }

    await interaction.guild.members.ban(target.id, { reason, deleteMessageDays: 7 });
    await interaction.guild.members.unban(target.id, 'Softban unban');

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${e.ban} Softban Applied\n**User:** ${target.user.tag}\n**Reason:** ${reason}\nMessages from the last 7 days were deleted.`
      )
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};