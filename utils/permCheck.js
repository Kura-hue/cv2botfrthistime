export function hasPerms(member, ...perms) {
  return perms.every((p) => member.permissions.has(p));
}

export function botHasPerms(guild, ...perms) {
  return perms.every((p) => guild.members.me.permissions.has(p));
}