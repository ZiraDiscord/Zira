'use strict';

const translate = require('google-translate-api');

exports.Run = async function Run(caller, command, GUILD) {
  const lang = caller.utils.getLang(GUILD.code);
  if (!command.params[0] || !command.params[1]) {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        title: lang.title,
        color: caller.color.blue,
        description: `**${command.prefix}${lang.translate}\n\n${lang.example}${command.prefix}translate es Hi, how are you today?`,
      },
    });
    return;
  }
  if (command.params.join(' ').indexOf('@everyone') !== -1 || command.params.join(' ').indexOf('@here') !== -1) return;
  const code = command.params[0];
  const string = command.params.splice(1).join(' ');
  translate(string, {
    to: code,
  }).then((res) => {
    caller.utils.message(command.msg.channel.id, `${command.msg.author.username}\n${res.from.language.iso} **->** ${code}\n\n${res.text}`);
  }).catch((e) => {
    caller.utils.message(command.msg.channel.id, `${e}`).catch(console.error);
  });
};

exports.Settings = function Settings() {
  return {
    show: false,
  };
};
