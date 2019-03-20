'use strict';

exports.Run = async function Run(caller, member, newChannel, oldChannel, GuildDB) {
  const Guild = GuildDB;
  if (Guild.privateChannel && !member.bot) {
    if (newChannel.id === Guild.privateChannel) {
      let privateChannel;
      try {
        privateChannel = await caller.utils.createChannel(member.guild.id, {
          name: `${member.username} [Private Room]`,
          type: 2,
          bitrate: 64000,
          position: newChannel.position + 1,
          parent_id: newChannel.parentID,
          permission_overwrites: [
            {
              id: newChannel.guild.id,
              type: 'role',
              allow: 1024,
              deny: 1048576,
            },
            {
              id: member.id,
              type: 'member',
              allow: 17826816,
              deny: 0,
            },
            {
              id: caller.bot.user.id,
              type: 'member',
              allow: 286262288,
              deny: 0,
            },
          ],
        });
      } catch (e) {
        caller.logger.warn(`[voiceChannelSwitch:privateChannel] ${e.code} ${e.message.replace(/\n\s/g, '')}`);
      }
      try {
        await caller.utils.createChannel(member.guild.id, {
          name: `🡱 Waiting for move [${member.username}]`,
          type: 2,
          bitrate: 64000,
          position: newChannel.position + 2,
          parent_id: newChannel.parentID,
          permission_overwrites: [
            {
              id: newChannel.guild.id,
              type: 'role',
              allow: 0,
              deny: 3146753,
            },
            {
              id: member.id,
              type: 'member',
              allow: 16777216,
              deny: 0,
            },
            {
              id: caller.bot.user.id,
              type: 'member',
              allow: 286261264,
              deny: 0,
            },
          ],
        });
        await member.edit({ channelID: privateChannel.id }, 'Private Room Function');

        await member.guild.channels.find((chann) => chann.id === Guild.privateChannel).editPermission(member.id, 0, 1048576, 'member');
        setTimeout(async () => {
          await member.guild.channels.find((chann) => chann.id === Guild.privateChannel).deletePermission(member.id);
        }, 15000);
      } catch (e) {
        caller.logger.warn(`[voiceChannelSwitch:moveChannel] ${e.code} ${e.message.replace(/\n\s/g, '')}`);
      }
    }
    try {
      if (oldChannel.name.indexOf(`${member.username} [Private Room]`) > -1) {
        const pattern = oldChannel.name.replace(' [Private Room]', '');
        const mover = `🡱 Waiting for move [${pattern}]`;
        const move = member.guild.channels.find((chann) => chann.name === mover);
        await move.delete();
        await oldChannel.delete();
      }
    } catch (e) {
      caller.logger.warn(`[voiceChannelSwitch:oldChannel] ${e.code} ${e.message.replace(/\n\s/g, '')}`);
    }
  }
};
