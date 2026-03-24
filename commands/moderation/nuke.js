import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Clone and delete the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const confirmContainer = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${e.warn} Nuke Confirmation\nThis will **delete** and **recreate** <#${interaction.channel.id}>. All messages will be permanently lost.\n\nAre you sure?`
      )
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('nuke_yes').setLabel('Nuke it').setStyle(ButtonStyle.Danger).setEmoji('💣'),
      new ButtonBuilder().setCustomId('nuke_no').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
    );

    const reply = await interaction.reply({
      components: [confirmContainer, row],
      flags: [4096],
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 15_000,
      max: 1,
    });

    collector.on('collect', async (btn) => {
      if (btn.customId === 'nuke_yes') {
        const position = interaction.channel.position;
        const newChannel = await interaction.channel.clone({ reason: `Nuked by ${interaction.user.tag}` });
        await newChannel.setPosition(position);
        await interaction.channel.delete();

        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## 💣 Channel Nuked\nThis channel was nuked by <@${interaction.user.id}>.`)
        );
        newChannel.send({ components: [container], flags: [4096] });
      } else {
        await btn.update({
          components: [
            new ContainerBuilder().addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`${e.cross} Nuke cancelled.`)
            ),
          ],
        });
      }
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        interaction.editReply({ content: 'Confirmation timed out.', components: [] }).catch(() => {});
      }
    });
  },
};