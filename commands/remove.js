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
            name: command.prefix + command.command + lang.commands.remove.params,
            value: `${lang.commands.remove.help}\n${
              lang.commands.remove.description
            }`,
          },
          {
            name: lang.example,
            value: `${command.prefix +
              command.command} :white_check_mark: Verification\n${command.prefix +
              command.command} :white_check_mark: Verification, ${
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
  const removeCount = guild.roles.filter((r) => r.remove).length;
  if (!guild.premium && removeCount > 7 && process.env.PREMIUM) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.titles.error,
        description: lang.commands.remove.limit,
        color: caller.color.yellow,
      },
    });
    return;
  }
  const emoji = command.params[0];
  const Params = command.params
    .splice(1)
    .join(' ')
    .split(', ');
  Params.forEach((item, index) => {
    if (item.indexOf('<@&') !== -1) Params[index] = item.replace(/\D+/g, '');
  });
  const [remove] = command.msg.channel.guild.roles.filter(
    (r) => r.id === Params[0] ||
      r.name.toLowerCase().indexOf(Params[0].toLowerCase()) !== -1,
  );
  if (!remove) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.errors.ordinalPair.replace(
          '$pair',
          caller.utils.ordinalSuffix(1),
        ),
      },
    });
    return;
  }
  let add;
  if (Params[1]) {
    [add] = command.msg.channel.guild.roles.filter(
      (r) => r.id === Params[1] ||
        r.name.toLowerCase().indexOf(Params[1].toLowerCase()) !== -1,
    );
    if (!add) {
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.yellow,
          title: lang.titles.error,
          description: lang.errors.ordinalPair.replace(
            '$pair',
            caller.utils.ordinalSuffix(1),
          ),
        },
      });
      return;
    }
  }
  let emojiFree = true;
  for (let r = 0; r < guild.roles.length; r++) {
    if (guild.roles[r].msg === guild.message) {
      console.log(guild.roles[r].emoji === emoji, guild.roles[r].emoji, emoji);
      if (guild.roles[r].emoji === emoji) emojiFree = false;
    }
  }
  if (!emojiFree) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.errors.usedEmoji.replace(
          '$pair',
          caller.utils.ordinalSuffix(1),
        ),
      },
    });
    return;
  }
  try {
    await caller.bot.addMessageReaction(
      guild.currentChannel,
      guild.currentMessage,
      emoji.replace(/(<:)|(<)|(>)/g, ''),
    );
  } catch (e) {
    caller.logger.warn(
      `[Remove] ${command.msg.channel.id} ${e.code} ${e.message.replace(
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
    return;
  }
  const message = add
    ? lang.commands.remove.removeAdd
        .replace('$role1', remove.mention)
        .replace('$role2', add.mention)
    : lang.commands.remove.remove
        .replace('$role', remove.mention);
  guild.roles.push({
    add: add ? add.id : null,
    id: remove.id,
    name: add
    ? `${remove.mention}, ${add.mention}`
    : remove.mention,
    emoji,
    message: guild.currentMessage,
    channel: guild.currentChannel,
    remove: true,
  });
  caller.bot.createMessage(command.msg.channel.id, {
    embed: {
      title: lang.titles.complete,
      description: message + lang.commands.remove.emoji.replace('$emoji', emoji),
      color: caller.color.green,
    },
  });
  caller.utils.updateGuild(guild);
};

exports.Settings = {
  category: 0,
  command: 'remove',
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
