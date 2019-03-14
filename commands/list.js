'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  const pages = [
    {
      embed: {
        color: caller.color.blue,
        title: lang.commands.list.title.replace('$name', command.guild.name),
        fields: [],
      },
    },
  ];
  guild.roles.forEach((role, count) => {
    if (pages[pages.length - 1].embed.fields.length >= 10) {
      pages.push({
        embed: {
          color: caller.color.blue,
          title: lang.commands.list.title.replace('$name', command.guild.name),
          fields: [],
        },
      });
    }
    let type = lang.commands.list.types[0];
    if (role.toggle) [, type] = lang.commands.list.types;
    if (role.once) [,, type] = lang.commands.list.types;
    if (role.multi) [,,, type] = lang.commands.list.types;
    if (role.remove) [,,,, type] = lang.commands.list.types;
    let name = role.multi ? role.name : `<@&${role.id}>`;
    name = role.remove ? role.name : name;
    pages[pages.length - 1].embed.fields.push({
      name: count + 1,
      value: `${lang.commands.list.name} ${name}\n${lang.commands.list.channel} <#${role.channel}>\n${lang.commands.list.message} ${role.message}\n${
        lang.commands.list.emoji
      } ${role.emoji}\n${lang.commands.list.type} ${type}\n`,
      inline: true,
    });
  });
  pages.forEach((obj, page) => {
    pages[page].embed.footer = {
      text: `${lang.help.page} ${page + 1}/${pages.length}`,
    };
  });
  caller.utils.pagination(pages, command.msg.channel, command.msg.author.id);
};

exports.Settings = {
  category: 0,
  command: 'list',
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
