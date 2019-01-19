'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  switch (command.params[0]) {
    case 'channel': {
      if (command.params[1] === 'disable') {
        guild.leaveChannel = null;
        caller.utils.updateGuild(guild);
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.green,
            title: lang.titles.complete,
            description: lang.commands.leave.channelDisable,
          },
        });
        return;
      }
      const channel = command.channels.get(caller.utils.parseID(command.params[1]));
      if (!channel) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.yellow,
            title: lang.titles.error,
            description: lang.errors.unknownChannel,
          },
        });
        return;
      }
      guild.leaveChannel = channel.id;
      caller.utils.updateGuild(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.green,
          title: lang.titles.complete,
          description: lang.commands.leave.channelSet + channel.mention,
        },
      });
      break;
    }
    case 'message': {
      if (!command.params[1]) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            description: lang.commands.leave.messageMissing,
            color: caller.color.yellow,
          },
        });
        return;
      }
      const message = command.params.splice(1).join(' ');
      guild.leaveMessage = message;
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.complete,
          description: lang.commands.leave.messageSet,
          color: caller.color.green,
        },
      });
      caller.utils.updateGuild(guild);
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
              lang.commands.leave.main[0].name,
            value: lang.commands.leave.main[0].value,
          }, {
            name:
              command.prefix +
              command.command +
              lang.commands.leave.main[1].name,
            value: lang.commands.leave.main[1].value,
          }, {
            name: lang.commands.leave.placeholderTitle,
            value: lang.commands.leave.placeholders,
          },
        ],
      },
    });
  }
};

exports.Settings = {
  command: 'leave',
  category: 2,
  show: true,
  permissions: ['manageMessages'],
  dm: false,
};
