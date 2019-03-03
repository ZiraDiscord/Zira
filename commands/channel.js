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
              command.prefix + command.command + lang.commands.channel.params,
            value: lang.commands.channel.help,
          },
          {
            name: lang.example,
            value: `${command.prefix + command.command} ${
              caller.utils.getRandomElement(
                command.channels.filter((c) => !c.type),
              ).mention
            }\n\n[${lang.guidePage}](https://docs.zira.ovh/${command.command})`,
          },
        ],
      },
    });
    return;
  }
  const channel = command.channels.get(caller.utils.parseID(command.params[0]));
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
  guild.currentChannel = channel.id;
  caller.utils
    .createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.green,
        title: lang.titles.complete,
        description: lang.commands.channel.set + channel.mention,
      },
    });
  caller.utils.updateGuild(guild);
};

exports.Settings = {
  category: 0,
  command: 'channel',
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
