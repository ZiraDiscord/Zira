'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  if (!command.params.length) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.blue,
        title: lang.titles.use,
        fields: [
          {
            name:
              command.prefix + command.command + lang.commands.message.params,
            value: lang.commands.message.help,
          },
          {
            name: lang.example,
            value: `${command.prefix + command.command} ${
              command.msg.id
            }\n${command.prefix +
              command.command} Epic message here :sunglasses:\n\n[${
              lang.guidePage
            }](https://zira.pw/guide/${command.command})`,
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
  if (command.params.length === 1 && !isNaN(command.params[0])) {
    let message;
    try {
      message = await caller.bot.getMessage(
        guild.currentChannel,
        caller.utils.parseID(command.params[0]),
      );
    } catch (e) {
      caller.logger.warn(
        `[Message Get] ${e.code} ${e.message.replace(/\n\s/g, '')}`,
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
    if (guild.messages.indexOf(message.id) === -1) {
      guild.messages.push(message.id);
    }
    guild.currentMessage = message.id;
    await caller.utils.updateGuild(guild);
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.green,
        title: lang.titles.complete,
        description: lang.commands.message.setID,
      },
    });
  } else {
    let message;
    try {
      message = await caller.bot.createMessage(
        guild.currentChannel,
        command.params.join(' '),
      );
    } catch (e) {
      caller.logger.warn(
        `[Message Send] ${e.code} ${e.message.replace(/\n\s/g, '')}`,
      );
      switch (e.code) {
        case 50001: // read
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.errors.missingPermissionChannelRead,
            },
          });
          break;
        case 50013: // send
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.errors.missingPermissionChannelSend,
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
    guild.messages.push(message.id);
    guild.currentMessage = message.id;
    await caller.utils.updateGuild(guild);
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.green,
        title: lang.titles.complete,
        description: lang.commands.message.setCreate,
      },
    });
  }
};

exports.Settings = {
  category: 0,
  command: 'message',
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
