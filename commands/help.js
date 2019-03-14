'use strict';

const fs = require('fs');
const { promisify } = require('util');

const getCommands = promisify(fs.readdir);

exports.Run = async function Run(caller, command, guild, lang) {
  const commandList = await getCommands('./commands');
  const pages = [
    {
      embed: {
        color: caller.color.blue,
        title: lang.help.categories[0],
        fields: [],
        footer: {
          text: `${lang.help.page} 1/4`,
        },
      },
    },
    {
      embed: {
        color: caller.color.blue,
        title: lang.help.categories[1],
        fields: [],
        footer: {
          text: `${lang.help.page} 2/4`,
        },
      },
    },
    {
      embed: {
        color: caller.color.blue,
        title: lang.help.categories[2],
        fields: [],
        footer: {
          text: `${lang.help.page} 3/4`,
        },
      },
    },
    {
      embed: {
        color: caller.color.blue,
        title: lang.help.categories[3],
        fields: [],
        footer: {
          text: `${lang.help.page} 4/4`,
        },
      },
    },
  ];
  commandList.forEach((file) => {
    try {
      const cmd = require(`./${file}`); // eslint-disable-line
      if (cmd.Settings.show) {
        pages[cmd.Settings.category].embed.fields.push({
          name:
            command.prefix +
            cmd.Settings.command +
            lang.commands[cmd.Settings.command].params,
          value: lang.commands[cmd.Settings.command].help,
        });
      }
    } catch (e) {
      caller.logger.warn(`[Help Command] Error ${e}`);
    } finally {
      delete require.cache[require.resolve(`./${file}`)];
    }
  });
  pages.forEach((obj, page) => {
    pages[page].embed.fields.push({
      name: lang.help.title,
      value: lang.help.links.join('\n'),
    });
  });
  let page = command.params[0] ? Number(command.params[0] - 1) : 0;
  if (page > pages - 1) page = pages.length - 1;
  if (page < 0) page = 0;
  caller.utils.pagination(pages, command.msg.channel, command.msg.author.id, page);
};

exports.Settings = {
  command: 'help',
  show: false,
  permissions: [],
  dm: true,
};
