import { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h ${m % 60}m ${s % 60}s`;
}

export default {
  data: new SlashCommandBuilder().setName('uptime').setDescription('Check bot uptime'),

  async execute(interaction, client) {
    await interaction.deferReply();
    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${e.info} Uptime\n**Online since:** <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>\n**Duration:** \`${formatUptime(client.uptime)}\``
      )
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};