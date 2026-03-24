import { handleCommandError } from '../handlers/errorHandler.js';
import { handleTicketButton } from '../commands/tickets/setup.js';

export default {
  name: 'interactionCreate',
  async execute(client, interaction) {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (err) {
        await handleCommandError(interaction, err);
      }
      return;
    }

    // Button interactions
    if (interaction.isButton()) {
      // Ticket buttons
      if (
        interaction.customId.startsWith('ticket_open_') ||
        interaction.customId === 'ticket_close' ||
        interaction.customId === 'ticket_claim'
      ) {
        return handleTicketButton(interaction, client);
      }

      // Confirmation buttons (handled inline per command)
      return;
    }

    // Select menus
    if (interaction.isStringSelectMenu()) {
      return;
    }
  },
};