'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  if (command.params[0] === 'disable') {
    guild.log = null;
    caller.utils.updateGuild(guild);
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.green,
        title: lang.titles.complete,
        description: lang.commands.log.disabled,
      },
    });
    return;
  }
  const channel = command.channels.get(caller.utils.parseID(command.params[0]));
  if (!channel) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.errors.unknownChannel,
      },
    });
    return;
  }
  guild.log = channel.id;
  caller.utils.updateGuild(guild);
  caller.utils.createMessage(command.msg.channel.id, {
    embed: {
      color: caller.color.green,
      title: lang.titles.complete,
      description: lang.commands.log.set + channel.mention,
    },
  });
};

exports.Settings = {
  command: 'log',
  category: 2,
  show: true,
  permissions: ['manageGuild'],
  dm: false,
};
