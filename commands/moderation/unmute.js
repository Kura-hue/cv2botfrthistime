import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';
import Guild from '../../models/Guild.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove mute role from a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('user').setDescription('Member to unmute').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getMember('user');
    const guildData = await Guild.findOne({ guildId: interaction.guild.id });
    if (!guildData?.muteRole) return interaction.editReply({ content: `${e.cross} No mute role set.` });
    const muteRole = interaction.guild.roles.cache.get(guildData.muteRole);
    if (!muteRole) return interaction.editReply({ content: `${e.cross} Mute role not found.` });
    await target.roles.remove(muteRole);
    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${e.check} **${target.user.tag}** has been unmuted.`)
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};