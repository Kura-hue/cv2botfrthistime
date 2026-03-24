import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge messages matching a filter')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((s) =>
      s.setName('bots').setDescription('Delete bot messages').addIntegerOption((o) => o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1).setMaxValue(100))
    )
    .addSubcommand((s) =>
      s.setName('humans').setDescription('Delete human messages').addIntegerOption((o) => o.setName('amount').setDescription('Amount').setRequired(true).setMinValue(1).setMaxValue(100))
    )
    .addSubcommand((s) =>
      s.setName('contains').setDescription('Delete messages containing text')
        .addStringOption((o) => o.setName('text').setDescription('Text to match').setRequired(true))
        .addIntegerOption((o) => o.setName('amount').setDescription('Amount to scan').setMinValue(1).setMaxValue(100))
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const sub = interaction.options.getSubcommand();
    const amount = interaction.options.getInteger('amount') || 50;

    let messages = await interaction.channel.messages.fetch({ limit: 100 });

    if (sub === 'bots') {
      messages = messages.filter((m) => m.author.bot).first(amount);
    } else if (sub === 'humans') {
      messages = messages.filter((m) => !m.author.bot).first(amount);
    } else if (sub === 'contains') {
      const text = interaction.options.getString('text').toLowerCase();
      messages = messages.filter((m) => m.content.toLowerCase().includes(text)).first(amount);
    }

    const deleted = await interaction.channel.bulkDelete([...messages], true);

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${e.check} Purged **${deleted.size}** messages (filter: \`${sub}\`).`)
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};