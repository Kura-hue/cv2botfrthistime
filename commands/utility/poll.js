import {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a quick poll')
    .addStringOption((o) => o.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption((o) => o.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption((o) => o.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption((o) => o.setName('option3').setDescription('Option 3'))
    .addStringOption((o) => o.setName('option4').setDescription('Option 4')),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
    ].filter(Boolean);

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.info} Poll\n**${question}**`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(options.map((o, i) => `${emojis[i]} ${o}`).join('\n'))
      );

    const row = new ActionRowBuilder().addComponents(
      ...options.map((o, i) =>
        new ButtonBuilder()
          .setCustomId(`poll_${i}`)
          .setLabel(`${o.slice(0, 60)}`)
          .setEmoji(emojis[i])
          .setStyle(ButtonStyle.Secondary)
      )
    );

    await interaction.reply({ components: [container, row], flags: [4096] });
  },
};