import { SlashCommandBuilder, EmbedBuilder, ContainerBuilder, TextDisplayBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Display info about a hex color')
    .addStringOption((o) => o.setName('hex').setDescription('Hex code (e.g. #5865f2)').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const hex = interaction.options.getString('hex').replace('#', '');
    const int = parseInt(hex, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;

    const embed = new EmbedBuilder().setColor(int).setTitle(`Color #${hex.toUpperCase()}`).setThumbnail(`https://singlecolorimage.com/get/${hex}/128x128`);

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**HEX:** \`#${hex.toUpperCase()}\`\n**RGB:** \`rgb(${r}, ${g}, ${b})\`\n**Int:** \`${int}\``
      )
    );

    await interaction.editReply({ embeds: [embed], components: [container], flags: [4096] });
  },
};