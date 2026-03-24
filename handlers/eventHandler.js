import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadEvents(client) {
  const eventsPath = join(__dirname, '..', 'events');
  const files = readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    const event = await import(pathToFileURL(join(eventsPath, file)).href);
    const evt = event.default;
    if (evt.once) {
      client.once(evt.name, (...args) => evt.execute(client, ...args));
    } else {
      client.on(evt.name, (...args) => evt.execute(client, ...args));
    }
    logger.info(`Event: ${evt.name}`);
  }
}