import { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('timestamp')
    .setDescription('Generate Discord timestamps')
    .addIntegerOption((o) => o.setName('unix').setDescription('Unix timestamp (default: now)')),

  async execute(interaction) {
    await interaction.deferReply();
    const unix = interaction.options.getInteger('unix') || Math.floor(Date.now() / 1000);

    const formats = ['t', 'T', 'd', 'D', 'f', 'F', 'R'].map(
      (f) => `\`<t:${unix}:${f}>\` → <t:${unix}:${f}>`
    ).join('\n');

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ⏱ Timestamps for \`${unix}\`\n${formats}`)
    );

    await interaction.editReply({ components: [container], flags: [4096] });
  },
};