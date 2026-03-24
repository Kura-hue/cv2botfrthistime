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
  name: 'mc-server',
  aliases: ['mcserver', 'mc'],
  description: 'Get Minecraft server status',

  async execute(message, args) {
    const ip = args[0];
    if (!ip) return message.reply({ content: `${e.cross} Usage: \`!mc-server <ip[:port]>\`` });

    const loading = await message.channel.send({ content: `${e.loading} Pinging **${ip}**...` });

    try {
      const res = await axios.get(`https://api.mcsrvstat.us/3/${ip}`);
      const data = res.data;

      const embed = new EmbedBuilder()
        .setColor(data.online ? Colors.minecraft : Colors.error)
        .setThumbnail(data.icon ? `https://api.mcsrvstat.us/icon/${ip}` : null);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.minecraft} Minecraft Server — \`${ip}\``))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

      if (!data.online) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`❌ **Server is OFFLINE**`)
        );
      } else {
        const motd = data.motd?.clean?.join('\n') || 'No MOTD';
        const players = data.players;
        const version = data.version;
        const playerList = players?.list?.map((p) => p.name).slice(0, 15).join(', ') || 'None listed';

        container
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `✅ **Status:** Online\n**Version:** ${version}\n**Players:** ${players?.online ?? 0} / ${players?.max ?? 0}`
            )
          )
          .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**MOTD:**\n\`\`\`${motd}\`\`\``)
          );

        if (players?.online > 0) {
          container
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Online Players:**\n${playerList}`)
            );
        }
      }

      await loading.edit({ content: '', embeds: [embed], components: [container], flags: [4096] });
    } catch (err) {
      await loading.edit({ content: `${e.cross} Could not reach **${ip}**.` });
    }
  },
};