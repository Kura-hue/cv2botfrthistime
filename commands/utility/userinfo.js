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
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get detailed info about a user')
    .addUserOption((o) => o.setName('user').setDescription('Target user')),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    await user.fetch();

    const embed = new EmbedBuilder()
      .setColor(Colors.base)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setImage(user.bannerURL({ size: 1024 }) || null);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.info} ${user.tag}`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**ID:** \`${user.id}\`\n**Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n**Bot:** ${user.bot ? 'Yes' : 'No'}`
        )
      );

    if (member) {
      const roles = member.roles.cache
        .filter((r) => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => `<@&${r.id}>`)
        .slice(0, 10)
        .join(', ') || 'None';

      container
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Nickname:** ${member.nickname || 'None'}\n**Joined:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n**Highest Role:** <@&${member.roles.highest.id}>\n**Roles [${member.roles.cache.size - 1}]:** ${roles}`
          )
        );
    }

    await interaction.editReply({ embeds: [embed], components: [container], flags: [4096] });
  },
};