'use strict';

exports.Run = async function Run(caller, guild, member, GuildDB) {
  const Guild = GuildDB;
  if (Guild.joinChannel && Guild.joinMessage) {
    if (!member.user.bot) {
      let msg = Guild.joinMessage;
      msg = msg.replace(/\$user/g, member.username);
      msg = msg.replace(/\$mention/g, `<@${member.id}>`);
      msg = msg.replace(/\$guild/g, guild.name);
      msg = msg.replace(/\$membercount/g, guild.memberCount);
      caller.utils.message(Guild.joinChannel, msg).catch((err) => {
        console.error(err);
        if (err.code === 50013 || err.code === 50001) {
          Guild.joinChannel = '';
          caller.utils.updateGuild(Guild);
        }
      });
    }
  }
  let fixed = false;
  if (typeof Guild.user === 'undefined') {
    Guild.user = [];
    fixed = true;
  }
  if (typeof Guild.bot === 'undefined') {
    Guild.bot = [];
    fixed = true;
  }
  if (typeof Guild.user === 'string') {
    Guild.user = [Guild.user];
    fixed = true;
  }
  if (typeof Guild.bot === 'string') {
    Guild.bot = [Guild.bot];
    fixed = true;
  }
  if (fixed) caller.utils.updateGuild(Guild);
  switch (member.bot) {
    case false:
      if (!Guild.user[0]) return;
      guild.editMember(member.id, {
        roles: Guild.user,
      }, 'Autorole on join').catch(console.error);
      break;
    case true:
      if (!Guild.bot[0]) return;
      guild.editMember(member.id, {
        roles: Guild.bot,
      }, 'Autorole on join').catch(console.error);
      break;
    default:
  }
};
