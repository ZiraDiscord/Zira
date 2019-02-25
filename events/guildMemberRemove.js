'use strict';

exports.Run = async function Run(caller, guild, member, GuildDB) {
  const Guild = GuildDB;
  if (Guild.leaveChannel && Guild.leaveMessage) {
    if (!member.user.bot) {
      let msg = Guild.leaveMessage[caller.utils.randomNumber(0, Guild.leaveMessage.length - 1)];
      if (msg) {
        msg = msg.replace(/\$user/g, member.user.username);
        msg = msg.replace(/\$mention/g, `<@${member.id}>`);
        msg = msg.replace(/\$guild/g, guild.name);
        msg = msg.replace(/\$membercount/g, guild.memberCount);
        caller.bot.createMessage(Guild.leaveChannel, msg).catch((e) => {
          caller.logger.warn(`[guildMemberRemove] ${e.code} ${e.message.replace(/\n\s/g, '')}`);
          if (e.code === 50013 || e.code === 50001) {
            Guild.leaveChannel = '';
            caller.utils.updateGuild(Guild);
          }
        });
      }
    }
  }
  const once = await caller.db.get('once');
  const claimedUser = await once.findOne({ id: member.id });
  if (claimedUser) {
    const start = claimedUser.claimed.length;
    claimedUser.claimed.forEach((role, index) => {
      if (guild.roles.get(role)) claimedUser.claimed.splice(index, 1);
    });
    if (start !== claimedUser.claimed.length) {
      once.findOneAndUpdate({ id: claimedUser.id }, claimedUser);
    }
  }
};
