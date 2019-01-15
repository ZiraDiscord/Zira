'use strict';

const colors = [
  [0xff0000, 'Red'],
  [0xffaa00, 'Orange'],
  [0xfff000, 'Yellow'],
  [0x009752, 'Green'],
  [0x00FFFF, 'Cyan'],
  [0x0040ff, 'Blue'],
  [0x9f00ff, 'Purple'],
  [0xff00cd, 'Pink'],
];

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  const bot = command.guild.members.get(caller.bot.user.id).permission.json;
  if (!bot.manageRoles) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.commands.colors.perms,
      },
    });
    return;
  }
  let roles = '';
  for (let index = 0; index < colors.length; index++) {
    let [role] = command.guild.roles.filter(r => r.name === colors[index][1]);
    if (role) continue; // eslint-disable-line no-continue
    if (index !== 0 && roles.length) roles += ', ';
    try {
      role = await caller.bot.createRole(
        command.guild.id,
        {
          name: colors[index][1],
          color: colors[index][0],
        },
        'Color Roles',
      );
    } catch (e) {
      caller.logger.warn(
        `[Colors] ${command.msg.channel.id} ${e.code} ${e.message.replace(
          /\n\s/g,
          '',
        )}`,
      );
      return;
    }
    roles += role.mention;
  }
  if (!roles.length) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.green,
        title: lang.titles.complete,
        description: lang.commands.colors.none,
      },
    });
    return;
  }
  caller.utils.createMessage(command.msg.channel.id, {
    embed: {
      color: caller.color.green,
      title: lang.titles.complete,
      description: lang.commands.colors.done + roles,
    },
  });
};

exports.Settings = {
  command: 'colors',
  category: 3,
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
