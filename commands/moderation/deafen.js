import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deafen')
    .setDescription('Server deafen/undeafen a member in voice')
    .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
    .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getMember('user');
    if (!target?.voice.channel) {
      return interaction.editReply({ content: `${e.cross} That member is not in a voice channel.` });
    }
    const deafened = !target.voice.serverDeaf;
    await target.voice.setDeaf(deafened);
    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.check} **${target.user.tag}** has been ${deafened ? 'server deafened' : 'undeafened'}.`
      )
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};