import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move a member to another voice channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .addUserOption((o) => o.setName('user').setDescription('Member to move').setRequired(true))
    .addChannelOption((o) => o.setName('channel').setDescription('Target voice channel').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getMember('user');
    const channel = interaction.options.getChannel('channel');

    if (!target?.voice.channel) return interaction.editReply({ content: `${e.cross} Member is not in a voice channel.` });
    if (channel.type !== 2) return interaction.editReply({ content: `${e.cross} That is not a voice channel.` });

    await target.voice.setChannel(channel);
    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${e.check} Moved **${target.user.tag}** to **${channel.name}**.`)
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};