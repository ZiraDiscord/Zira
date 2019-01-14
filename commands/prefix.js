'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  const prefix = command.params[0];
  if (!prefix || prefix.length < 1 || prefix.length > 10 || prefix.search(/[.?[\]\\/<>\-=+*^$!]/g) === -1) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.titles.error,
        description: lang.commands.prefix.error,
        color: caller.color.yellow,
      },
    });
    return;
  }
  guild.prefix = prefix;
  caller.utils.updateGuild(guild);
  caller.utils.createMessage(command.msg.channel.id, {
    embed: {
      title: lang.titles.complete,
      description: lang.commands.prefix.set + guild.prefix,
      color: caller.color.green,
    },
  });
};

exports.Settings = {
  command: 'prefix',
  category: 3,
  show: true,
  permissions: ['manageGuild'],
  dm: false,
};
