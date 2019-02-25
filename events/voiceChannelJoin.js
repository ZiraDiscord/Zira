'use strict';

exports.Run = async function Run(caller, member, newChannel, GuildDB) {
  const Guild = GuildDB;
  if (Guild.privateChannel && !member.bot) {
    if (Guild.privateChannel === newChannel.id) {
      const newPos = newChannel.position + 1;

      let privateChannel;
      try {
        privateChannel = await member.guild.createChannel(`${member.username} [Private Room]`, 2, 'Private Rooms Function', newChannel.parentID);
        await privateChannel.editPosition(newChannel.guild.id, newPos);
        await privateChannel.editPermission(member.guild.id, 1024, 1048576, 'role');
        await privateChannel.editPermission(member.id, 17826816, 0, 'member');
        await privateChannel.editPermission(caller.bot.user.id, 286262288, 0, 'member');
      } catch (e) {
        caller.logger.warn(
          `[voiceChannelJoin:privateChannel] ${e.code} ${e.message.replace(/\n\s/g, '')}`,
        );
      }

      try {
        const move = await member.guild.createChannel(`Delete Room [${member.username}]`, 2, 'Private Rooms Function / Waiting For Move', newChannel.parentID);
        await move.editPosition(newChannel.guild.id, newPos + 1);
        await move.editPermission(member.guild.id, 0, 2097153, 'role');
        await move.editPermission(member.id, 16777216, 0, 'member');
        await move.editPermission(caller.bot.user.id, 286261264, 0, 'member');
        await member.edit({ channelID: privateChannel.id }, 'Private Room Function');
        await member.guild.channels
          .find((chann) => chann.id === Guild.privateChannel)
          .editPermission(member.id, 0, 1048576, 'member');
        setTimeout(async () => {
          await member.guild.channels
            .find((chann) => chann.id === Guild.privateChannel)
            .deletePermission(member.id)
            .catch((err) => console.error(err));
        }, 15000);
      } catch (e) {
        caller.logger.warn(
          `[voiceChannelJoin:moveChannel] ${e.code} ${e.message.replace(/\n\s/g, '')}`,
        );
      }
    }
  }
};
