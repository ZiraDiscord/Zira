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
            name: command.prefix + command.command + lang.commands.add.params,
            value: `${lang.commands.add.help}\n${
              lang.commands.add.description
            }`,
          },
          {
            name: lang.example,
            value: `${command.prefix +
              command.command} :information_source: Updates\n${command.prefix +
              command.command} :information_source: Updates, <:thirp:450747331512369152> ${
              caller.utils.getRandomElement(
                command.roles.filter((r) => r.name !== '@everyone'),
              ).mention
            }\n\n[${lang.guidePage}](https://zira.pw/guide/${command.command})`,
          },
        ],
      },
    });
    return;
  }
  if (
    !guild.currentChannel ||
    !guild.currentMessage ||
    !guild.messages.length
  ) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.errors.setChannelOrMessage,
      },
    });
    return;
  }
  const params = caller.utils.parseParams(command.params);
  const added = [];
  for (let index = 0; index < params.length; index++) {
    const [role] = command.msg.channel.guild.roles.filter((r) => r.id === params[index][1] || r.name.toLowerCase().indexOf(params[index][1].toLowerCase()) !== -1);
    if (!role) {
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.yellow,
          title: lang.titles.error,
          description: lang.errors.ordinalPair.replace(
            '$pair',
            caller.utils.ordinalSuffix(index + 1),
          ),
        },
      });
      break;
    }
    const free = {
      emoji: true,
      role: true,
    };
    for (let i = 0; i < guild.roles.length; i++) {
      if (guild.roles[i].message === guild.currentMessage) {
        if (guild.roles[i].id === role.id) free.role = false;
        if (guild.roles[i].emoji === params[index][0]) free.emoji = false;
      }
    }
    if (!free.emoji) {
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.yellow,
          title: lang.titles.error,
          description: lang.errors.usedEmoji.replace(
            '$pair',
            caller.utils.ordinalSuffix(index + 1),
          ),
        },
      });
      break;
    }
    if (!free.role) {
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.yellow,
          title: lang.titles.error,
          description: lang.errors.usedRole.replace(
            '$pair',
            caller.utils.ordinalSuffix(index + 1),
          ),
        },
      });
      break;
    }
    try {
      await caller.bot.addMessageReaction(
        guild.currentChannel,
        guild.currentMessage,
        params[index][0].replace(/(<:)|(<)|(>)/g, ''),
      );
    } catch (e) {
      caller.logger.warn(
        `[Add] ${command.msg.channel.id} ${e.code} ${e.message.replace(
          /\n\s/g,
          '',
        )}`,
      );
      switch (e.code) {
        case 10003:
        case 50001: // read access
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.errors.missingPermissionChannelRead,
            },
          });
          break;
        case 50013: // reaction access
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.errors.missingPermissionChannelReaction,
            },
          });
          break;
        case 10008: // unknown message
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.errors.unknownMessage,
            },
          });
          break;
        case 10014: // unknown emoji
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.errors.unknownEmoji,
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
      break;
    }
    added.push({
      id: role.id,
      emoji: params[index][0],
    });
    guild.roles.push({
      id: role.id,
      name: role.name,
      emoji: params[index][0],
      message: guild.currentMessage,
      channel: guild.currentChannel,
    });
  }
  let description = '';
  added.forEach((obj) => {
    description += lang.commands.add.set
      .replace('$id', obj.id)
      .replace('$emoji', obj.emoji);
  });
  if (description) {
    description += `\n${lang.commands.add.end}`;
    caller.utils
      .createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.complete,
          description,
          color: caller.color.green,
        },
      });
  }
  caller.utils.updateGuild(guild);
};

exports.Settings = {
  category: 0,
  command: 'add',
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
