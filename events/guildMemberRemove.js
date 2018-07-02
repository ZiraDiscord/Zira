'use strict';

exports.Run = async function Run(caller, guild, member, GuildDB) {
  const Guild = GuildDB;
  if (Guild.leaveChannel && Guild.leaveMessage) {
    if (!member.user.bot) {
      let msg = Guild.leaveMessage;
      msg = msg.replace(/\$user/g, member.user.username);
      msg = msg.replace(/\$mention/g, `<@${member.id}>`);
      msg = msg.replace(/\$guild/g, guild.name);
      msg = msg.replace(/\$membercount/g, guild.memberCount);
      caller.utils.message(Guild.leaveChannel, msg).catch((err) => {
        console.error(err);
        if (err.code === 50013 || err.code === 50001) {
          Guild.leaveChannel = '';
          caller.utils.updateGuild(Guild);
        }
      });
    }
  }
};
