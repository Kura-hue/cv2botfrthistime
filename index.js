import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Options,
} from 'discord.js';
import mongoose from 'mongoose';
import { loadSlashCommands } from './handlers/slashHandler.js';
import { loadPrefixCommands } from './handlers/prefixHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import { logger } from './utils/logger.js';
import { DisTube } from 'distube';
import { SpotifyPlugin } from '@distube/spotify';
import { SoundCloudPlugin } from '@distube/soundcloud';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  makeCache: Options.cacheWithLimits({
    MessageManager: 200,
    PresenceManager: 0,
  }),
});

// Collections
client.slashCommands = new Collection();
client.prefixCommands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Collection();
client.snipes = new Collection();
client.editSnipes = new Collection();

// DisTube music engine
client.distube = new DisTube(client, {
  plugins: [new SpotifyPlugin(), new SoundCloudPlugin()],
  emitNewSongOnly: true,
  joinNewVoiceChannel: true,
});

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.success('MongoDB connected'))
  .catch((err) => logger.error('MongoDB error:', err));

// Load handlers
await loadSlashCommands(client);
await loadPrefixCommands(client);
await loadEvents(client);

client.login(process.env.DISCORD_TOKEN);

export default client;