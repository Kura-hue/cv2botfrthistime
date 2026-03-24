import { SlashCommandBuilder, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { e } from '../../utils/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((s) =>
      s.setName('add').setDescription('Add a role')
        .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true))
        .addRoleOption((o) => o.setName('role').setDescription('Role to add').setRequired(true))
    )
    .addSubcommand((s) =>
      s.setName('remove').setDescription('Remove a role')
        .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true))
        .addRoleOption((o) => o.setName('role').setDescription('Role to remove').setRequired(true))
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.editReply({ content: `${e.cross} That role is higher than my highest role.` });
    }

    if (sub === 'add') {
      await target.roles.add(role);
    } else {
      await target.roles.remove(role);
    }

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.check} **${sub === 'add' ? 'Added' : 'Removed'}** role <@&${role.id}> ${sub === 'add' ? 'to' : 'from'} **${target.user.tag}**.`
      )
    );
    await interaction.editReply({ components: [container], flags: [4096] });
  },
};