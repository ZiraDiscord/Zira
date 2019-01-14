'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  switch (command.params[0]) {
    case 'role': {
      if (!command.params[1]) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.yellow,
            title: lang.titles.error,
            description: lang.commands.config.role.noParam,
          },
        });
        return;
      }
      if (command.params[1].toLowerCase() === 'disable') {
        guild.commandRole = null;
        await caller.utils.updateGuild(guild);
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.green,
            title: lang.titles.complete,
            description: lang.commands.config.role.disable,
          },
        });
        return;
      }
      const [role] = command.msg.channel.guild.roles.filter((r) => r.id === command.params[1].replace(/\D+/g, '') ||
          r.name.toLowerCase() === command.params[1].toLowerCase());
      if (!role) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.yellow,
            title: lang.titles.error,
            description: lang.commands.config.role.noParam,
          },
        });
        return;
      }
      guild.commandRole = role.id;
      await caller.utils.updateGuild(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.green,
          title: lang.titles.complete,
          description: lang.commands.config.role.success.replace(
            '$role',
            role.mention,
          ),
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
                lang.commands.config.main[0].name,
              value: lang.commands.config.main[0].value,
            },
          ],
        },
      });
  }
};

exports.Settings = {
  category: 3,
  command: 'config',
  show: true,
  permissions: ['manageGuild'],
  dm: false,
};
