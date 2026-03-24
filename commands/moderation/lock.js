import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
} from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((o) => o.setName('channel').setDescription('Channel to lock (default: current)')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.lock} Channel Locked\n<#${channel.id}> has been locked by <@${interaction.user.id}>.`)
    );
    await interaction.editReply({ components: [container], flags: [4096] });
    channel.send({ components: [container], flags: [4096] }).catch(() => {});
  },
};