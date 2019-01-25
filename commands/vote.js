'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  caller.utils.createMessage(command.msg.channel.id, {
    embed: {
      color: caller.color.blue,
      description: lang.commands.vote.description.replace('$link', `https://discordbots.org/bot/275813801792634880/vote${command.guild ? `?guild=${command.guild.id}` : ''}`),
    },
  });
};

exports.Settings = {
  command: 'vote',
  category: 3,
  show: true,
  permissions: [],
  dm: true,
};
