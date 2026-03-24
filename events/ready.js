import { ActivityType } from 'discord.js';
import { logger } from '../utils/logger.js';
import { startGiveawayChecker } from '../utils/giveawayChecker.js';
import { startReminderChecker } from '../utils/reminderChecker.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.success(`Logged in as ${client.user.tag}`);
    logger.info(`Guilds: ${client.guilds.cache.size} | Users: ${client.users.cache.size}`);

    client.user.setPresence({
      activities: [{ name: '/help | Master Bot v4.0', type: ActivityType.Watching }],
      status: 'online',
    });

    startGiveawayChecker(client);
    startReminderChecker(client);
  },
};