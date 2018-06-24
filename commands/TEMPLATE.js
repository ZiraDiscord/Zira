'use strict';

exports.Run = async function Run(caller, command, GUILD) {
  if (!command.msg.channel.guild) {
    caller.bot.createMessage(command.msg.channel.id, {
      embed: {
        description: ':warning: This command can\'t be used in DM',
        color: caller.color.yellow,
      },
    }).catch(console.error);
    return; // eslint-disable-line
  }
  const guild = GUILD;
};

exports.Settings = function Settings() {
  return {
    show: false,
  };
};
