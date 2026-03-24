import {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),

  async execute(interaction, client) {
    const start = Date.now();
    await interaction.deferReply();
    const latency = Date.now() - start;
    const wsLatency = client.ws.ping;

    const bar = (ms) => (ms < 100 ? '🟢' : ms < 200 ? '🟡' : '🔴');

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.info} Latency`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${bar(latency)} **API Latency** — \`${latency}ms\`\n${bar(wsLatency)} **WebSocket** — \`${wsLatency}ms\``
        )
      );

    await interaction.editReply({ components: [container], flags: [4096] });
  },
};