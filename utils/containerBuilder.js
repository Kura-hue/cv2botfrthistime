import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Colors } from './colors.js';
import { e } from './emojis.js';

/**
 * Creates a standardized info container with header and fields
 */
export function buildInfoContainer({ title, description, fields = [], color }) {
  const container = new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${title}`)
  );

  if (description) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(description)
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  for (const field of fields) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${field.name}**\n${field.value}`)
    );
  }

  return container;
}

/**
 * Creates a two-column field container using inline fields
 */
export function buildFieldGrid(fields) {
  const container = new ContainerBuilder();
  let row = '';
  fields.forEach((f, i) => {
    row += `**${f.name}**\n${f.value}`;
    if (i % 2 === 1 || i === fields.length - 1) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(row));
      row = '';
    } else {
      row += '   ·   ';
    }
  });
  return container;
}

/**
 * Success container
 */
export function successContainer(message) {
  return new ContainerBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${e.check} **Success** — ${message}`)
  );
}

/**
 * Error container
 */
export function errorContainer(message, refId = null) {
  const c = new ContainerBuilder();
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${e.cross} **System Error**\n${message}${refId ? `\n\`Ref: ${refId}\`` : ''}`
    )
  );
  return c;
}

/**
 * Confirmation container with Yes/No buttons
 */
export function confirmContainer(question) {
  const container = new ContainerBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${e.warn} Confirmation\n${question}`)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('confirm_yes').setLabel('Confirm').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('confirm_no').setLabel('Cancel').setStyle(ButtonStyle.Danger)
  );

  return { container, row };
}