import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((o) =>
      o.setName('seconds').setDescription('Slowmode in seconds (0 to disable)').setMinValue(0).setMaxValue(21600).setRequired(true)
    )
    .addChannelOption((o) => o.setName('channel').setDescription('Channel')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await channel.setRateLimitPerUser(seconds);

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        seconds === 0
          ? `${e.unlock} Slowmode disabled in <#${channel.id}>.`
          : `${e.lock} Slowmode set to **${seconds}s** in <#${channel.id}>.`
      )
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};