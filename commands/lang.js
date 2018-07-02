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

exports.Run = async function Run(caller, command, GUILD) {
  if (!command.msg.channel.guild) {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        description: ':warning: This command can\'t be used in DM',
        color: caller.color.yellow,
      },
    });
    return;
  }
  const guild = GUILD;
  let lang = caller.utils.getLang(guild.lang);
  if (command.msg.author.id === process.env.OWNER || command.msg.member.permission.has('manageGuild')) {
    const code = (command.params[0]) ? Sanitize(command.params[0]) : 'thisisntalanguage';
    if (fs.existsSync(`./lang/${code}.json`)) {
      guild.lang = code;
      lang = require(`../lang/${code}.json`); // eslint-disable-line
      caller.utils.message(command.msg.channel.id, {
        embed: {
          description: lang.lang.langUpdate,
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
      description += lang.lang.translate;
      caller.utils.message(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          description,
        },
      });
    }
  } else {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        title: lang.titleError,
        description: lang.perm.noGuildPerm,
        color: caller.color.yellow,
      },
    });
  }
};

exports.Settings = function Settings() {
  return {
    show: true,
    category: 'misc',
  };
};
