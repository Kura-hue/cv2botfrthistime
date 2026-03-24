import { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Retrieve the last deleted message in this channel'),

  async execute(interaction, client) {
    await interaction.deferReply();
    const snipe = client.snipes.get(interaction.channel.id);

    if (!snipe) {
      return interaction.editReply({ content: 'No recently deleted messages found.' });
    }

    const embed = new EmbedBuilder()
      .setColor(Colors.base)
      .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL() })
      .setDescription(snipe.content || '*[No text content]*')
      .setImage(snipe.image)
      .setTimestamp(snipe.at);

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Deleted** <t:${Math.floor(snipe.at / 1000)}:R> in <#${interaction.channel.id}>`)
    );

    await interaction.editReply({ embeds: [embed], components: [container], flags: [4096] });
  },
};