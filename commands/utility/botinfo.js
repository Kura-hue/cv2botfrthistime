import {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder,
} from 'discord.js';
import { Colors } from '../../utils/colors.js';
import { e } from '../../utils/emojis.js';
import os from 'os';
import process from 'process';
import config from '../../config.js';

export default {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('Information about the bot'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const memUsage = process.memoryUsage();
    const embed = new EmbedBuilder()
      .setColor(Colors.base)
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }));

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.info} ${client.user.username} v${config.version}`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Guilds:** ${client.guilds.cache.size}\n**Users:** ${client.users.cache.size}\n**Commands:** ${client.slashCommands.size + client.prefixCommands.size}\n**Uptime:** <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Node.js:** ${process.version}\n**Discord.js:** v14\n**Memory:** ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n**Platform:** ${os.platform()}`
        )
      );

    await interaction.editReply({ embeds: [embed], components: [container], flags: [4096] });
  },
};