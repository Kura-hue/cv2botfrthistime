import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';
import Guild from '../../models/Guild.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Apply mute role to a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('user').setDescription('Member to mute').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason';
    const guildData = await Guild.findOne({ guildId: interaction.guild.id });

    if (!guildData?.muteRole) {
      return interaction.editReply({ content: `${e.cross} No mute role configured. Use \`/config muterole\`.` });
    }

    const muteRole = interaction.guild.roles.cache.get(guildData.muteRole);
    if (!muteRole) return interaction.editReply({ content: `${e.cross} Mute role not found.` });

    await target.roles.add(muteRole, reason);

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.mute} Member Muted\n**User:** ${target.user.tag}\n**Reason:** ${reason}`)
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};