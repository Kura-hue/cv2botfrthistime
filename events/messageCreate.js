import Guild from '../models/Guild.js';
import { handlePrefixError } from '../handlers/errorHandler.js';

export default {
  name: 'messageCreate',
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    // Snipe tracking
    client.snipes.set(message.channel.id, {
      content: message.content,
      author: message.author,
      image: message.attachments.first()?.url || null,
      at: new Date(),
    });

    // Prefix resolution
    let prefix = process.env.PREFIX || '!';
    const guildData = await Guild.findOne({ guildId: message.guild.id }).lean();
    if (guildData?.prefix) prefix = guildData.prefix;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const cmdName = client.aliases.get(commandName) || commandName;
    const command = client.prefixCommands.get(cmdName);
    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (err) {
      await handlePrefixError(message, err);
    }
  },
};