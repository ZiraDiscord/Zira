'use strict';

exports.Run = async function Run(caller, member, oldChannel, GuildDB) {
  const Guild = GuildDB;
  if (Guild.privateChannel && !member.bot) {
    if (oldChannel.name.indexOf(`${member.username} [Private Room]`) > -1) {
      try {
      const pattern = oldChannel.name.replace(' [Private Room]', '');
      const mover = `🡱 Waiting for move [${pattern}]`;
      await member.guild.channels.find((chann) => chann.name === mover).delete();
      await oldChannel.delete();
      } catch (e) {
        caller.logger.warn(
          `[voiceChannelLeave] ${e.code} ${e.message.replace(/\n\s/g, '')}`,
        );
      }
    }
  }
};
