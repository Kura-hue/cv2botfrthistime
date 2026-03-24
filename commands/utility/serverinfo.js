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

export default {
  data: new SlashCommandBuilder().setName('serverinfo').setDescription('Get server information'),

  async execute(interaction) {
    await interaction.deferReply();
    const guild = interaction.guild;
    await guild.fetch();

    const embed = new EmbedBuilder()
      .setColor(Colors.base)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .setImage(guild.bannerURL({ size: 1024 }) || null);

    const channels = guild.channels.cache;
    const textCount = channels.filter((c) => c.type === 0).size;
    const voiceCount = channels.filter((c) => c.type === 2).size;
    const categoryCount = channels.filter((c) => c.type === 4).size;

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.info} ${guild.name}`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**ID:** \`${guild.id}\`\n**Owner:** <@${guild.ownerId}>\n**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>\n**Verification:** \`${guild.verificationLevel}\``
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Members:** ${guild.memberCount}\n**Roles:** ${guild.roles.cache.size}\n**Channels:** ${channels.size} (${textCount} text, ${voiceCount} voice, ${categoryCount} cat)\n**Boosts:** ${guild.premiumSubscriptionCount} (Level ${guild.premiumTier})\n**Emojis:** ${guild.emojis.cache.size}`
        )
      );

    await interaction.editReply({ embeds: [embed], components: [container], flags: [4096] });
  },
};