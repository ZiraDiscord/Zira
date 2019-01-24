'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  switch (command.params[0]) {
    case 'user': {
      if (!command.params[1]) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.use,
            color: caller.color.blue,
            fields: [
              {
                name:
                  command.prefix +
                  command.command +
                  lang.commands.autorole.ubParams,
                value: lang.commands.message.user,
              },
            ],
          },
        });
        return;
      }
      let guildrole;
      if (
        command.params[1].indexOf('<@&') !== -1 ||
        isNaN(command.params[1]) === false
      ) {
        [guildrole] = command.guild.roles.filter(
          (r) => r.id === command.params[1].replace(/\D/g, ''),
        );
      } else {
        const rolename = command.params
          .splice(1)
          .join(' ')
          .toLowerCase();
        [guildrole] = command.guild.roles.filter(
          (m) => m.name.toLowerCase() === rolename,
        );
      }
      if (!guildrole) {
        caller.utils
          .createMessage(command.msg.channel.id, {
            embed: {
              title: lang.titles.error,
              color: caller.color.yellow,
              description: lang.errors.unknownRole,
            },
          });
        return;
      }
      if (guild.user.indexOf(guildrole.id) !== -1) {
        const old = guild.user[guild.user.indexOf(guildrole.id)];
        guild.user.splice(guild.user.indexOf(guildrole.id), 1);
        caller.utils
          .createMessage(command.msg.channel.id, {
            embed: {
              title: lang.titles.complete,
              color: caller.color.green,
              description: lang.commands.autorole.userRemove.replace('$role', `<@&${old}>`),
            },
          });
        caller.utils.updateGuild(guild);
      } else {
        guild.user.push(guildrole.id);
        caller.utils
          .createMessage(command.msg.channel.id, {
            embed: {
              title: lang.titles.complete,
              color: caller.color.green,
              description: lang.commands.autorole.userAdd.replace('$role', `<@&${guildrole.id}>`),
            },
          });
        caller.utils.updateGuild(guild);
      }
      break;
    }
    case 'bot': {
      if (!command.params[1]) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.use,
            color: caller.color.blue,
            fields: [
              {
                name:
                  command.prefix +
                  command.command +
                  lang.commands.autorole.ubParams,
                value: lang.commands.message.bot,
              },
            ],
          },
        });
        return;
      }
      let guildrole;
      if (
        command.params[1].indexOf('<@&') !== -1 ||
        isNaN(command.params[1]) === false
      ) {
        [guildrole] = command.guild.roles.filter(
          (r) => r.id === command.params[1].replace(/\D/g, ''),
        );
      } else {
        const rolename = command.params
          .splice(1)
          .join(' ')
          .toLowerCase();
        [guildrole] = command.guild.roles.filter(
          (m) => m.name.toLowerCase() === rolename,
        );
      }
      if (!guildrole) {
        caller.utils
          .createMessage(command.msg.channel.id, {
            embed: {
              title: lang.titles.error,
              color: caller.color.yellow,
              description: lang.errors.unknownRole,
            },
          });
        return;
      }
      if (guild.bot.indexOf(guildrole.id) !== -1) {
        const old = guild.bot[guild.bot.indexOf(guildrole.id)];
        guild.bot.splice(guild.bot.indexOf(guildrole.id), 1);
        caller.utils
          .createMessage(command.msg.channel.id, {
            embed: {
              title: lang.titles.complete,
              color: caller.color.green,
              description: lang.commands.autorole.botRemove.replace('$role', `<@&${old}>`),
            },
          });
        caller.utils.updateGuild(guild);
      } else {
        guild.bot.push(guildrole.id);
        caller.utils
          .createMessage(command.msg.channel.id, {
            embed: {
              title: lang.titles.complete,
              color: caller.color.green,
              description: lang.commands.autorole.botAdd.replace('$role', `<@&${guildrole.id}>`),
            },
          });
        caller.utils.updateGuild(guild);
      }
      break;
    }
    case 'show': {
      let user = guild.user[0] ? '' : lang.commands.autorole.nonSet;
      let bot = guild.bot[0] ? '' : lang.commands.autorole.nonSet;
      guild.user.forEach((id) => {
        user += `<@&${id}>\n`;
      });
      guild.bot.forEach((id) => {
        bot += `<@&${id}>\n`;
      });
      caller.utils
        .createMessage(command.msg.channel.id, {
          embed: {
            title: lang.commands.autorole.title,
            color: caller.color.blue,
            fields: [
              {
                name: lang.commands.autorole.showUser,
                value: user,
              },
              {
                name: lang.commands.autorole.showBot,
                value: bot,
              },
            ],
          },
        });
      break;
    }
    default:
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.blue,
        title: lang.titles.use,
        fields: [
          {
            name:
              command.prefix +
              command.command +
              lang.commands.autorole.main[0].name,
            value: lang.commands.autorole.main[0].value,
          },
          {
            name:
              command.prefix +
              command.command +
              lang.commands.autorole.main[1].name,
            value: lang.commands.autorole.main[1].value,
          },
          {
            name:
              command.prefix +
              command.command +
              lang.commands.autorole.main[2].name,
            value: lang.commands.autorole.main[2].value,
          },
        ],
      },
    });
  }
};

exports.Settings = {
  command: 'autorole',
  category: 0,
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
