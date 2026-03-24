import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder,
} from 'discord.js';
import { Colors } from '../../utils/colors.js';
import { e } from '../../utils/emojis.js';
import axios from 'axios';

export default {
  name: 'roblox',
  aliases: ['rbx'],
  description: 'Fetch Roblox user info',

  async execute(message, args) {
    const username = args[0];
    if (!username) {
      return message.reply({ content: `${e.cross} Usage: \`!roblox <username>\`` });
    }

    const loading = await message.channel.send({ content: `${e.loading} Fetching Roblox data...` });

    try {
      // Get user ID
      const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
        usernames: [username], excludeBannedUsers: false,
      });
      const userData = userRes.data.data[0];
      if (!userData) {
        loading.edit({ content: `${e.cross} User **${username}** not found on Roblox.` });
        return;
      }

      const userId = userData.id;

      // Get profile, friends, followers, following
      const [profileRes, friendsRes, followersRes, followingRes, groupsRes] = await Promise.allSettled([
        axios.get(`https://users.roblox.com/v1/users/${userId}`),
        axios.get(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
        axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
        axios.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
        axios.get(`https://groups.roblox.com/v1/users/${userId}/groups/roles`),
      ]);

      const profile = profileRes.value?.data;
      const friends = friendsRes.value?.data?.count ?? 'N/A';
      const followers = followersRes.value?.data?.count ?? 'N/A';
      const following = followingRes.value?.data?.count ?? 'N/A';
      const groups = groupsRes.value?.data?.data?.length ?? 0;

      const avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;
      const profileUrl = `https://www.roblox.com/users/${userId}/profile`;
      const created = new Date(profile.created);

      const embed = new EmbedBuilder()
        .setColor(Colors.roblox)
        .setThumbnail(avatarUrl);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.roblox} Roblox — ${profile.displayName} (@${profile.name})`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**User ID:** \`${userId}\`\n**Display Name:** ${profile.displayName}\n**Username:** @${profile.name}\n**Created:** <t:${Math.floor(created.getTime() / 1000)}:D>\n**Description:** ${profile.description?.slice(0, 200) || 'No description'}`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Friends:** ${friends.toLocaleString()}\n**Followers:** ${followers.toLocaleString()}\n**Following:** ${following.toLocaleString()}\n**Groups:** ${groups}\n**Banned:** ${profile.isBanned ? '⚠ Yes' : 'No'}`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`[🔗 View Profile](${profileUrl})`)
        );

      await loading.edit({ content: '', embeds: [embed], components: [container], flags: [4096] });
    } catch (err) {
      await loading.edit({ content: `${e.cross} Failed to fetch Roblox data: ${err.message}` });
    }
  },
};