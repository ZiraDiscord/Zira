'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  switch (command.params[0]) {
    case 'channel': {
      if (command.params[1] === 'disable') {
        guild.joinChannel = null;
        caller.utils.updateGuild(guild);
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.green,
            title: lang.titles.complete,
            description: lang.commands.join.channelDisable,
          },
        });
        return;
      }
      const channel = command.channels.get(
        caller.utils.parseID(command.params[1]),
      );
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
      guild.joinChannel = channel.id;
      caller.utils.updateGuild(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.green,
          title: lang.titles.complete,
          description: lang.commands.join.channelSet + channel.mention,
        },
      });
      break;
    }
    case 'add': {
      if (!command.params[1]) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            description: lang.commands.join.messageMissing,
            color: caller.color.yellow,
          },
        });
        return;
      }
      const message = command.params.splice(1).join(' ');
      guild.joinMessage.push(message);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.complete,
          description: lang.commands.join.messageSet,
          color: caller.color.green,
        },
      });
      caller.utils.updateGuild(guild);
      break;
    }
    case 'remove': {
      if (!command.params[1] || isNaN(parseInt(command.params[1], 10))) {
        let messages = '';
        guild.joinMessage.forEach((message, index) => {
          messages += `${index}. ${message}`;
        });
        if (!messages.length) messages = lang.commands.join.noMessages;
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.use,
            description: lang.commands.join.messagePick + messages,
            color: caller.color.blue,
          },
        });
        return;
      }
      if (guild.joinMessage[parseInt(command.params[1], 10)]) {
        guild.joinMessage.splice(parseInt(command.params[1], 10), 1);
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.complete,
            description: lang.commands.join.messageRemove,
            color: caller.color.green,
          },
        });
        caller.utils.updateGuild(guild);
      } else {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            description: lang.commands.join.unknownID,
            color: caller.color.yellow,
          },
        });
      }
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
                lang.commands.join.main[0].name,
              value: lang.commands.join.main[0].value,
            },
            {
              name:
                command.prefix +
                command.command +
                lang.commands.join.main[1].name,
              value: lang.commands.join.main[1].value,
            }, {
              name:
                command.prefix +
                command.command +
                lang.commands.join.main[2].name,
              value: lang.commands.join.main[2].value,
            },
            {
              name: lang.commands.join.placeholderTitle,
              value: lang.commands.join.placeholders,
            },
          ],
        },
      });
  }
};

exports.Settings = {
  command: 'join',
  category: 2,
  show: true,
  permissions: ['manageMessages'],
  dm: false,
};
