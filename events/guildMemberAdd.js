'use strict';

exports.Run = async function Run(caller, guild, member, GuildDB) {
  const Guild = GuildDB;
  if (Guild.joinChannel && Guild.joinMessage && Guild.joinMessage.length) {
    if (!member.user.bot) {
      let msg = Guild.joinMessage[caller.utils.randomNumber(0, Guild.joinMessage.length - 1)];
      msg = msg.replace(/\$user/g, member.username);
      msg = msg.replace(/\$mention/g, `<@${member.id}>`);
      msg = msg.replace(/\$guild/g, guild.name);
      msg = msg.replace(/\$membercount/g, guild.memberCount);
      caller.bot.createMessage(Guild.joinChannel, msg).catch((e) => {
        caller.logger.warn(
          `[guildMemberAdd] ${e.code} ${e.message.replace(
            /\n\s/g,
            '',
          )}`,
        );
        if (e.code === 50013 || e.code === 50001) {
          Guild.joinChannel = '';
          caller.utils.updateGuild(Guild);
        }
      });
    }
  }
  switch (member.bot) {
    case false:
      if (!Guild.user[0]) return;
      guild.editMember(member.id, {
        roles: Guild.user,
      }, 'Autorole on join').catch((e) => {
        caller.logger.warn(
          `[guildMemberAdd] ${e.code} ${e.message.replace(
            /\n\s/g,
            '',
          )}`,
        );
      });
      break;
    case true:
      if (!Guild.bot[0]) return;
      guild.editMember(member.id, {
        roles: Guild.bot,
      }, 'Autorole on join').catch((e) => {
        caller.logger.warn(
          `[guildMemberAdd] ${e.code} ${e.message.replace(
            /\n\s/g,
            '',
          )}`,
        );
      });
      break;
    default:
  }
};
