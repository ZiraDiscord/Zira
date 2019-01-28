'use strict';

const fs = require('fs');
const {
  promisify,
} = require('util');

function Sanitize(string) {
  let str = string;
  while (string.indexOf('../') !== -1) {
    str = string.replace('../', '');
  }
  while (string.indexOf('./') !== -1) {
    str = string.replace('./', '');
  }
  return str;
}

const readdir = promisify(fs.readdir);


// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  const code = (command.params[0]) ? Sanitize(command.params[0]) : 'thisisntalanguage';
    if (fs.existsSync(`./lang/${code}.json`)) {
      guild.lang = code;
      lang = require(`../lang/${code}.json`); // eslint-disable-line
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          description: lang.commands.lang.update,
          color: caller.color.green,
        },
      });
      caller.utils.updateGuild(guild);
    } else {
      const files = await readdir('./lang/');
      let description = '';
      files.forEach((file) => {
        if (file.indexOf('.json') !== -1) {
          description += `**${command.prefix}lang ${file.split('.json')[0]}** ~~-~~ ${require(`../lang/${file}`).language}\n`; // eslint-disable-line
        }
      });
      description += lang.commands.lang.translate;
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          description,
        },
      });
    }
};

exports.Settings = {
  command: 'lang',
  category: 3,
  show: true,
  permissions: ['manageGuild'],
  dm: false,
};
