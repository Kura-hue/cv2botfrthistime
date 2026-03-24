import { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';
import axios from 'axios';

export default {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to another language')
    .addStringOption((o) => o.setName('text').setDescription('Text to translate').setRequired(true))
    .addStringOption((o) => o.setName('to').setDescription('Target language code (e.g. es, fr, ja)').setRequired(true))
    .addStringOption((o) => o.setName('from').setDescription('Source language (default: auto)')),

  async execute(interaction) {
    await interaction.deferReply();
    const text = interaction.options.getString('text');
    const to = interaction.options.getString('to');
    const from = interaction.options.getString('from') || 'auto';

    try {
      const res = await axios.get('https://api.mymemory.translated.net/get', {
        params: { q: text, langpair: `${from}|${to}` },
      });

      const translated = res.data.responseData.translatedText;

      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🌐 Translation`))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Original [\`${from}\`]:**\n${text}\n\n**Translated [\`${to}\`]:**\n${translated}`)
        );

      await interaction.editReply({ components: [container], flags: [4096] });
    } catch {
      await interaction.editReply({ content: `${e.cross} Translation failed. Check the language code.` });
    }
  },
};