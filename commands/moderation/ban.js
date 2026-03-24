import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from 'discord.js';
import { Colors } from '../../utils/colors.js';
import { e } from '../../utils/emojis.js';
import ModLog from '../../models/ModLog.js';
import Guild from '../../models/Guild.js';

async function logModAction(guild, data) {
  const guildData = await Guild.findOne({ guildId: guild.id });
  let caseNum = 1;
  const last = await ModLog.findOne({ guildId: guild.id }).sort({ caseNumber: -1 });
  if (last) caseNum = last.caseNumber + 1;

  await ModLog.create({ guildId: guild.id, caseNumber: caseNum, ...data });

  if (guildData?.modLogChannel) {
    const ch = guild.channels.cache.get(guildData.modLogChannel);
    if (ch) {
      const embed = new EmbedBuilder()
        .setColor(Colors.error)
        .setTitle(`Case #${caseNum} — ${data.type}`)
        .addFields(
          { name: 'Target', value: `<@${data.targetId}> (${data.targetTag})`, inline: true },
          { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
          { name: 'Reason', value: data.reason || 'No reason provided' }
        )
        .setTimestamp();
      ch.send({ embeds: [embed] }).catch(() => {});
    }
  }
  return caseNum;
}

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason for ban'))
    .addIntegerOption((o) =>
      o.setName('days').setDescription('Delete messages from last X days (0-7)').setMinValue(0).setMaxValue(7)
    ),

  async execute(interaction, client) {
    await interaction.deferReply();
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') ?? 0;

    const member = interaction.guild.members.cache.get(target.id);

    if (member) {
      if (!member.bannable) {
        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${e.cross} I cannot ban this user — they may have a higher role.`)
        );
        return interaction.editReply({ components: [container], flags: [4096] });
      }
      if (
        member.roles.highest.position >= interaction.member.roles.highest.position &&
        interaction.guild.ownerId !== interaction.user.id
      ) {
        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${e.cross} You cannot ban someone with an equal or higher role.`)
        );
        return interaction.editReply({ components: [container], flags: [4096] });
      }
    }

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.error)
            .setTitle(`You have been banned from ${interaction.guild.name}`)
            .addFields(
              { name: 'Reason', value: reason },
              { name: 'Moderator', value: interaction.user.tag }
            )
            .setTimestamp(),
        ],
      }).catch(() => {});

      await interaction.guild.members.ban(target.id, { reason, deleteMessageDays: days });

      const caseNum = await logModAction(interaction.guild, {
        type: 'BAN',
        targetId: target.id,
        targetTag: target.tag,
        moderatorId: interaction.user.id,
        moderatorTag: interaction.user.tag,
        reason,
      });

      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.ban} Member Banned`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**User:** ${target.tag} (\`${target.id}\`)\n**Reason:** ${reason}\n**Case:** #${caseNum}\n**Moderator:** ${interaction.user.tag}`
          )
        );

      await interaction.editReply({ components: [container], flags: [4096] });
    } catch (err) {
      throw err;
    }
  },
};