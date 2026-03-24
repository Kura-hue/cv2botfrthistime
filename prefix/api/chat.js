import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder,
} from 'discord.js';
import { Colors } from '../../utils/colors.js';
import { e } from '../../utils/emojis.js';
import Groq from 'groq-sdk';
import AIHistory from '../../models/AIHistory.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MAX_HISTORY = 10;

export default {
  name: 'chat',
  aliases: ['ask', 'ai'],
  description: 'Chat with Groq AI',

  async execute(message, args) {
    const input = args.join(' ');
    if (!input) return message.reply({ content: `${e.cross} Usage: \`!chat <message>\`` });

    const typing = message.channel.sendTyping();

    try {
      let historyDoc = await AIHistory.findOne({
        userId: message.author.id,
        guildId: message.guild.id,
      });

      if (!historyDoc) {
        historyDoc = new AIHistory({
          userId: message.author.id,
          guildId: message.guild.id,
          history: [],
        });
      }

      // Keep last N messages
      const recentHistory = historyDoc.history.slice(-MAX_HISTORY * 2);
      const messages = [
        {
          role: 'system',
          content:
            'You are a helpful, sharp, and concise AI assistant in a Discord server. Keep answers under 800 characters. Be direct and insightful.',
        },
        ...recentHistory.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: input },
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: 'llama3-70b-8192',
        max_tokens: 512,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 'No response.';

      // Save to history
      historyDoc.history.push({ role: 'user', content: input });
      historyDoc.history.push({ role: 'assistant', content: response });
      historyDoc.updatedAt = new Date();
      if (historyDoc.history.length > MAX_HISTORY * 2 + 4) {
        historyDoc.history = historyDoc.history.slice(-MAX_HISTORY * 2);
      }
      await historyDoc.save();

      const embed = new EmbedBuilder().setColor(Colors.accent);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.groq} Groq AI`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**You:** ${input}`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**AI:** ${response}`));

      await message.reply({ components: [container], flags: [4096] });
    } catch (err) {
      await message.reply({ content: `${e.cross} AI error: ${err.message?.slice(0, 200)}` });
    }
  },
};