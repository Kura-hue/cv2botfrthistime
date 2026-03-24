import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadPrefixCommands(client) {
  const foldersPath = join(__dirname, '..', 'prefix');
  const folders = readdirSync(foldersPath);
  let count = 0;

  for (const folder of folders) {
    const files = readdirSync(join(foldersPath, folder)).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      const cmd = await import(pathToFileURL(join(foldersPath, folder, file)).href);
      if (cmd.default?.name && cmd.default?.execute) {
        client.prefixCommands.set(cmd.default.name, cmd.default);
        if (cmd.default.aliases) {
          cmd.default.aliases.forEach((a) => client.aliases.set(a, cmd.default.name));
        }
        count++;
      }
    }
  }

  logger.success(`Loaded ${count} prefix commands`);
}