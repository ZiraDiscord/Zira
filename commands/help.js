'use strict';

const fs = require('fs');
const {
  promisify,
} = require('util');

const getCommands = promisify(fs.readdir);

exports.Run = async function Run(caller, command, GUILD) {
  const lang = caller.utils.getLang(GUILD);
  const commands = await getCommands('./commands');
  const embed = {
    color: caller.color.blue,
    title: lang.help.commandsTitle,
    fields: [{
        name: lang.help.categories.role,
        value: '',
      }, {
        name: lang.help.categories.logs,
        value: '',
      }, {
        name: lang.help.categories.suggestion,
        value: '',
      },
      {
        name: lang.help.categories.misc,
        value: '',
      },
      {
        name: lang.help.linksTitle,
        value: lang.help.links,
      },
    ],
  };
  commands.forEach((file) => {
    try {
      const cmd = require(`./${file}`); // eslint-disable-line
      if (cmd.Settings().show) {
        switch (cmd.Settings().category) {
          case 'role':
            embed.fields[0].value += `**${command.prefix}${file.split('.')[0]}** ~~-~~ ${lang.help.commands[file.split('.')[0]]}`;
            break;
          case 'logs':
            embed.fields[1].value += `**${command.prefix}${file.split('.')[0]}** ~~-~~ ${lang.help.commands[file.split('.')[0]]}`;
            break;
          case 'suggestion':
            embed.fields[2].value += `**${command.prefix}${file.split('.')[0]}** ~~-~~ ${lang.help.commands[file.split('.')[0]]}`;
            break;
          default:
            embed.fields[3].value += `**${command.prefix}${file.split('.')[0]}** ~~-~~ ${lang.help.commands[file.split('.')[0]]}`;
        }
      }
    } catch (e) {
      caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
    } finally {
      delete require.cache[require.resolve(`./${file}`)];
    }
  });
  caller.utils.message(command.msg.channel.id, {
    embed,
  }).catch(console.error);
};

exports.Settings = function Settings() {
  return {
    show: false,
  };
};
