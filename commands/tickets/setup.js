import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionOverwriteManager,
  EmbedBuilder,
} from 'discord.js';
import { Colors } from '../../utils/colors.js';
import { e } from '../../utils/emojis.js';
import Ticket from '../../models/Ticket.js';
import Guild from '../../models/Guild.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket system management')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) =>
      s.setName('setup').setDescription('Set up the ticket panel')
        .addChannelOption((o) => o.setName('channel').setDescription('Channel for the panel').setRequired(true))
        .addStringOption((o) => o.setName('description').setDescription('Panel description'))
    )
    .addSubcommand((s) =>
      s.setName('close').setDescription('Close the current ticket')
        .addStringOption((o) => o.setName('reason').setDescription('Reason for closing'))
    )
    .addSubcommand((s) =>
      s.setName('add').setDescription('Add a user to the ticket')
        .addUserOption((o) => o.setName('user').setDescription('User to add').setRequired(true))
    )
    .addSubcommand((s) =>
      s.setName('remove').setDescription('Remove a user from the ticket')
        .addUserOption((o) => o.setName('user').setDescription('User to remove').setRequired(true))
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'setup') {
      await interaction.deferReply({ ephemeral: true });
      const channel = interaction.options.getChannel('channel');
      const description = interaction.options.getString('description') || 'Select a category below to open a support ticket.';

      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.ticket} Support Tickets`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(description))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Categories:**\n🛠 **General Support** — Help with the server\n📋 **Report** — Report a user or issue\n💡 **Other** — Anything else`
          )
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_open_general')
          .setLabel('General Support')
          .setEmoji('🛠')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('ticket_open_report')
          .setLabel('Report')
          .setEmoji('📋')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('ticket_open_other')
          .setLabel('Other')
          .setEmoji('💡')
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({ components: [container, row], flags: [4096] });

      await Guild.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { ticketLogChannel: channel.id },
        { upsert: true }
      );

      await interaction.editReply({ content: `${e.check} Ticket panel sent to <#${channel.id}>.` });
    }

    if (sub === 'close') {
      await interaction.deferReply({ ephemeral: true });
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id, status: 'open' });
      if (!ticket) return interaction.editReply({ content: `${e.cross} This is not an open ticket channel.` });

      const reason = interaction.options.getString('reason') || 'No reason provided';

      const confirmContainer = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${e.warn} Close Ticket\nAre you sure you want to close this ticket?\n**Reason:** ${reason}`
        )
      );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_close_confirm').setLabel('Close Ticket').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('ticket_close_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
      );

      const reply = await interaction.editReply({ components: [confirmContainer, row], fetchReply: true });

      const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 15_000,
        max: 1,
      });

      collector.on('collect', async (btn) => {
        if (btn.customId === 'ticket_close_confirm') {
          ticket.status = 'closed';
          ticket.closedAt = new Date();
          await ticket.save();

          const closedContainer = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${e.lock} Ticket Closed\n**Reason:** ${reason}\n**Closed by:** <@${interaction.user.id}>\n\nThis channel will be deleted in 5 seconds.`
            )
          );
          await btn.update({ components: [closedContainer] });
          setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        } else {
          await btn.update({ content: 'Close cancelled.', components: [] });
        }
      });
    }

    if (sub === 'add') {
      await interaction.deferReply({ ephemeral: true });
      const user = interaction.options.getMember('user');
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticket) return interaction.editReply({ content: `${e.cross} Not a ticket channel.` });
      await interaction.channel.permissionOverwrites.edit(user, { ViewChannel: true, SendMessages: true });
      await interaction.editReply({ content: `${e.check} Added <@${user.id}> to this ticket.` });
    }

    if (sub === 'remove') {
      await interaction.deferReply({ ephemeral: true });
      const user = interaction.options.getMember('user');
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticket) return interaction.editReply({ content: `${e.cross} Not a ticket channel.` });
      await interaction.channel.permissionOverwrites.edit(user, { ViewChannel: false });
      await interaction.editReply({ content: `${e.check} Removed <@${user.id}> from this ticket.` });
    }
  },
};

export async function handleTicketButton(interaction, client) {
  if (interaction.customId.startsWith('ticket_open_')) {
    await interaction.deferReply({ ephemeral: true });
    const category = interaction.customId.replace('ticket_open_', '');

    const existing = await Ticket.findOne({
      guildId: interaction.guild.id,
      userId: interaction.user.id,
      status: 'open',
    });

    if (existing) {
      return interaction.editReply({
        content: `${e.cross} You already have an open ticket: <#${existing.channelId}>`,
      });
    }

    const guildData = await Guild.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $inc: { ticketCounter: 1 } },
      { upsert: true, new: true }
    );

    const ticketNum = guildData.ticketCounter;

    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${String(ticketNum).padStart(4, '0')}`,
      type: ChannelType.GuildText,
      topic: `Ticket #${ticketNum} | User: ${interaction.user.tag} | Category: ${category}`,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'AttachFiles'] },
        { id: client.user.id, allow: ['ViewChannel', 'SendMessages', 'ManageChannels'] },
      ],
    });

    await Ticket.create({
      guildId: interaction.guild.id,
      channelId: ticketChannel.id,
      userId: interaction.user.id,
      ticketNumber: ticketNum,
      category,
    });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.ticket} Ticket #${String(ticketNum).padStart(4, '0')}`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**User:** <@${interaction.user.id}>\n**Category:** ${category}\n**Opened:** <t:${Math.floor(Date.now() / 1000)}:R>\n\nPlease describe your issue and a staff member will assist you shortly.`
        )
      );

    const closeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
      new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Success).setEmoji('✋')
    );

    await ticketChannel.send({ content: `<@${interaction.user.id}>`, components: [container, closeRow], flags: [4096] });
    await interaction.editReply({ content: `${e.check} Ticket created: <#${ticketChannel.id}>` });
  }
}