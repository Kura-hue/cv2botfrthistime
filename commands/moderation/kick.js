import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder,
} from 'discord.js';
import { Colors } from '../../utils/colors.js';
import { e } from '../../utils/emojis.js';
import ModLog from '../../models/ModLog.js';
import Guild from '../../models/Guild.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) => o.setName('user').setDescription('Member to kick').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.editReply({ content: `${e.cross} Member not found in this server.` });
    }
    if (!target.kickable) {
      return interaction.editReply({ content: `${e.cross} I cannot kick this member.` });
    }
    if (
      target.roles.highest.position >= interaction.member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      return interaction.editReply({ content: `${e.cross} You cannot kick someone with equal or higher role.` });
    }

    await target.user.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.warning)
          .setTitle(`Kicked from ${interaction.guild.name}`)
          .addFields({ name: 'Reason', value: reason })
          .setTimestamp(),
      ],
    }).catch(() => {});

    await target.kick(reason);

    const last = await ModLog.findOne({ guildId: interaction.guild.id }).sort({ caseNumber: -1 });
    const caseNum = (last?.caseNumber || 0) + 1;
    await ModLog.create({
      guildId: interaction.guild.id,
      caseNumber: caseNum,
      type: 'KICK',
      targetId: target.id,
      targetTag: target.user.tag,
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      reason,
    });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.kick} Member Kicked`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**User:** ${target.user.tag}\n**Reason:** ${reason}\n**Case:** #${caseNum}`
        )
      );

    await interaction.editReply({ components: [container], flags: [4096] });
  },
};