'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  if (command.params.length < 2) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.blue,
        title: lang.titles.use,
        fields: [
          {
            name: command.prefix + command.command + lang.commands.edit.params,
            value: lang.commands.edit.help,
          },
          {
            name: lang.example,
            value: `${command.prefix + command.command} ${
              command.msg.id
            } Epic new message\n\n[${lang.guidePage}](https://docs.zira.ovh/${
              command.command
            })`,
          },
        ],
      },
    });
    return;
  }
  if (!guild.currentChannel) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.errors.setChannel,
      },
    });
    return;
  }
  let message;
  try {
    message = await caller.bot.getMessage(
      guild.currentChannel,
      caller.utils.parseID(command.params[0]),
    );
  } catch (e) {
    caller.logger.warn(
      `[Edit Get] ${e.code} ${e.message.replace(/\n\s/g, '')}`,
    );
    switch (e.code) {
      case 50001:
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.yellow,
            title: lang.titles.error,
            description: lang.errors.missingPermissionChannelRead,
          },
        });
        break;
      case 404:
      case 10008:
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.yellow,
            title: lang.titles.error,
            description: lang.errors.unknownMessageID,
          },
        });
        break;
      default:
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.yellow,
            title: lang.titles.error,
            description: lang.errors.generic,
          },
        });
    }
    return;
  }
  if (message.author.id !== caller.bot.user.id) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.commands.edit.owner,
      },
    });
    return;
  }
  try {
    await caller.bot.editMessage(
      guild.currentChannel,
      command.params[0],
      command.params.splice(1, command.params.length).join(' '),
    );
  } catch (e) {
    // I don't know what errors would be here that weren't caught when getting the message so yea
    caller.logger.warn(
      `[Edit] ${e.code} ${e.message.replace(/\n\s/g, '')}`,
    );
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.errors.generic,
      },
    });
    return;
  }
  caller.utils.createMessage(command.msg.channel.id, {
    embed: {
      color: caller.color.green,
      title: lang.titles.complete,
      description: lang.commands.edit.success,
    },
  });
};

exports.Settings = {
  category: 0,
  command: 'edit',
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
