import {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Colors } from '../../utils/colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption((o) => o.setName('user').setDescription('Target user')),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const globalAvatar = user.displayAvatarURL({ size: 1024, dynamic: true });
    const serverAvatar = member?.displayAvatarURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setColor(Colors.base)
      .setTitle(`${user.tag}'s Avatar`)
      .setImage(serverAvatar || globalAvatar);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Global Avatar').setStyle(ButtonStyle.Link).setURL(globalAvatar)
    );

    if (serverAvatar && serverAvatar !== globalAvatar) {
      row.addComponents(
        new ButtonBuilder().setLabel('Server Avatar').setStyle(ButtonStyle.Link).setURL(serverAvatar)
      );
    }

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**User:** ${user.tag} (\`${user.id}\`)`)
    );

    await interaction.editReply({ embeds: [embed], components: [container, row], flags: [4096] });
  },
};