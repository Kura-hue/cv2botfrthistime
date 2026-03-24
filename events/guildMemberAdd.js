import { EmbedBuilder } from 'discord.js';
import Guild from '../models/Guild.js';
import { Colors } from '../utils/colors.js';

export default {
  name: 'guildMemberAdd',
  async execute(client, member) {
    const guildData = await Guild.findOne({ guildId: member.guild.id }).lean();
    if (!guildData?.welcomeChannel) return;

    const channel = member.guild.channels.cache.get(guildData.welcomeChannel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.accent)
      .setTitle(`Welcome to ${member.guild.name}!`)
      .setDescription(
        guildData.welcomeMessage?.replace('{user}', `<@${member.id}>`) ||
          `Welcome <@${member.id}>! You are member #${member.guild.memberCount}.`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});

    // Auto roles
    if (guildData.autoRoles?.length) {
      for (const roleId of guildData.autoRoles) {
        const role = member.guild.roles.cache.get(roleId);
        if (role) member.roles.add(role).catch(() => {});
      }
    }
  },
};