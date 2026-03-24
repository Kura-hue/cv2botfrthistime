import { EmbedBuilder } from 'discord.js';
import { Colors } from '../utils/colors.js';
import { logger } from '../utils/logger.js';

export function generateRefId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function handleCommandError(interaction, error) {
  const refId = generateRefId();
  logger.error(`[${refId}] Command error in ${interaction.commandName}:`, error);

  const embed = new EmbedBuilder()
    .setColor(Colors.error)
    .setTitle('⚠ System Error')
    .setDescription(
      `An unexpected error occurred while executing this command.\n\`\`\`${error.message?.slice(0, 200) || 'Unknown error'}\`\`\``
    )
    .addFields({ name: 'Reference ID', value: `\`${refId}\``, inline: true })
    .setFooter({ text: 'Please report this to the support server' })
    .setTimestamp();

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [embed], components: [] });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (_) {}
}

export async function handlePrefixError(message, error) {
  const refId = generateRefId();
  logger.error(`[${refId}] Prefix command error:`, error);

  const embed = new EmbedBuilder()
    .setColor(Colors.error)
    .setTitle('⚠ System Error')
    .setDescription(`\`\`\`${error.message?.slice(0, 200) || 'Unknown error'}\`\`\``)
    .addFields({ name: 'Ref', value: `\`${refId}\`` })
    .setTimestamp();

  message.channel.send({ embeds: [embed] }).catch(() => {});
}