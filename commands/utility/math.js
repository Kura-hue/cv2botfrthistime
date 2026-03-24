import { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('math')
    .setDescription('Evaluate a math expression')
    .addStringOption((o) => o.setName('expression').setDescription('Expression to evaluate').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const expr = interaction.options.getString('expression');

    try {
      // Safe eval using Function constructor with restricted scope
      const sanitized = expr.replace(/[^0-9+\-*/().% ]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();

      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Expression:** \`${expr}\`\n**Result:** \`${result}\``)
      );
      await interaction.editReply({ components: [container], flags: [4096] });
    } catch {
      await interaction.editReply({ content: `${e.cross} Invalid expression.` });
    }
  },
};