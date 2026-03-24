import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadSlashCommands(client) {
  const foldersPath = join(__dirname, '..', 'commands');
  const folders = readdirSync(foldersPath);
  let count = 0;

  for (const folder of folders) {
    const files = readdirSync(join(foldersPath, folder)).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      const cmd = await import(pathToFileURL(join(foldersPath, folder, file)).href);
      if (cmd.default?.data && cmd.default?.execute) {
        client.slashCommands.set(cmd.default.data.name, cmd.default);
        count++;
      } else {
        logger.warn(`Invalid slash command: ${file}`);
      }
    }
  }

  logger.success(`Loaded ${count} slash commands`);
}