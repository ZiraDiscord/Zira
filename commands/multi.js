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
            name: command.prefix + command.command + lang.commands.once.params,
            value: `${lang.commands.once.help}\n${
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
            }\n\n[${lang.guidePage}](https://docs.zira.ovh/${command.command})`,
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
  if (
    process.env.PREMIUM &&
    !guild.premium &&
    guild.roles.filter((r) => r.toggle).length > 11
  ) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.commands.toggle.limit,
      },
    });
    return;
  }
  const emoji = command.params[0];
  const params = command.params
    .splice(1)
    .join(' ')
    .split(', ');
  params.forEach((item, index) => {
    if (item.indexOf('<@&') !== -1) params[index] = item.replace(/\D+/g, '');
  });
  if (
    process.env.PREMIUM &&
    !guild.premium &&
    guild.roles.filter((r) => r.toggle).length + params.length > 11
  ) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.commands.toggle.over,
      },
    });
    return;
  }
  const roles = [];
  for (let index = 0; index < params.length; index++) {
    const [role] = command.guild.roles.filter(
      (r) => r.id === params[index] || r.name.toLowerCase() === params[index].toLowerCase(),
    );
    if (!role) {
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.yellow,
          title: lang.titles.error,
          description: lang.commands.multi.ordinal.replace(
            '$pos',
            caller.utils.ordinalSuffix(index + 1),
          ),
        },
      });
      return;
    }
    roles.push(role.id);
  }
  let free = true;
  for (let i = 0; i < guild.roles.length; i++) {
    if (guild.roles[i].message === guild.currentMessage) {
      if (guild.roles[i].emoji === emoji) free = false;
    }
  }
  if (!free) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.commands.multi.usedEmoji,
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
      `[Multi] ${command.msg.channel.id} ${e.code} ${e.message.replace(
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
  let name = '';
  roles.forEach((role, index) => {
    name += `<@&${role}>${index === roles.length - 1 ? '' : ', '}`;
  });
  guild.roles.push({
    ids: roles,
    name,
    emoji,
    message: guild.currentMessage,
    channel: guild.currentChannel,
    multi: true,
  });

  let description = '';
    description += lang.commands.multi.set
      .replace('$roles', name)
      .replace('$emoji', emoji);
  if (description) {
    description += `\n${lang.footer}`;
    caller.utils.createMessage(command.msg.channel.id, {
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
  command: 'multi',
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
