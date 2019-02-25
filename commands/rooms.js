'use strict';

exports.Run = async function Run(caller, command, guild, lang) {
  let channel;
  try {
    channel = await command.guild.createChannel('Create Private Room', 2, 'Private Rooms Function');
  } catch (e) {
    caller.logger.warn(`[rooms] ${e.code} ${e.message.replace(/\n\s/g, '')}`);
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.title.error,
        description: lang.errors.generic,
        color: caller.color.yellow,
      },
    });
    return;
  }

  guild.privateChannel = channel.id;
  caller.utils.updateGuild(guild);
  caller.utils.createMessage(command.msg.channel.id, {
    embed: {
      title: lang.commands.rooms.title,
      description: lang.commands.rooms.description,
      color: caller.color.green,
    },
  });
};

exports.Settings = {
  command: 'rooms',
  category: 3,
  show: true,
  permissions: ['manageGuild'],
  dm: false,
};
