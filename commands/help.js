'use strict';

const fs = require('fs');
const { promisify } = require('util');

const getCommands = promisify(fs.readdir);

exports.Run = async function Run(caller, command, GUILD, lang) {
  const commandList = await getCommands('./commands');
  const commands = [];
  const embed = {
    color: caller.color.blue,
    title: lang.help.commandsTitle,
    fields: [],
    footer: {
      text: lang.help.footer,
    },
  };
  commandList.forEach((file) => {
    try {
      const cmd = require(`./${file}`); // eslint-disable-line
      if (cmd.Settings.show) {
        commands.push({
          name:
            command.prefix +
            cmd.Settings.command +
            lang.commands[cmd.Settings.command].params,
          value: lang.commands[cmd.Settings.command].description,
        });
      }
    } catch (e) {
      caller.logger.warn(`[Help Command] Error ${JSON.stringify(e)}`);
    } finally {
      delete require.cache[require.resolve(`./${file}`)];
    }
  });
  if (commands.length > 10) {
    // do paged embed
  } else {
    embed.fields = commands;
  }
  embed.fields.push({
    name: lang.help.title,
    value: lang.help.links.join('\n'),
  });
  caller.utils
    .createMessage(command.msg.channel.id, {
      embed,
    });
};

exports.Settings = {
  command: 'help',
  show: false,
  permissions: [],
  dm: true,
};
