'use strict';

const translate = require('google-translate-api');

exports.Run = async function Run(caller, command, GUILD) {
  const lang = caller.utils.getLang(GUILD.code);
  if (!command.params[0] || !command.params[1]) {
    caller.bot.createMessage(command.msg.channel.id, {
      embed: {
        title: 'Command Usage',
        color: caller.color.blue,
        description: `**${command.prefix}${lang.translate}\n\n${lang.example}${command.prefix}translate es Hi, how are you today?`,
      },
    });
    return;
  }
  const code = command.params[0];
  const string = command.params.splice(1).join(' ');
  const res = await translate(string, {
    to: code,
  }).catch(console.error);
  caller.bot.createMessage(command.msg.channel.id, `${command.msg.author.username}\n${res.from.language.iso} **->** ${code}\n\n${res.text}`);
};

exports.Settings = function Settings() {
  return {
    show: false,
  };
};
