'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  switch (command.params[0]) {
    case 'channel': {
      const types = ['new', 'approved', 'denied', 'invalid', 'potential'];
      if (
        !command.params[1] ||
        types.indexOf(command.params[1].toLowerCase()) === -1 ||
        !command.params[2]
      ) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.use,
            color: caller.color.blue,
            fields: [
              {
                name:
                  command.prefix +
                  command.command +
                  lang.commands.suggestion.channel.help,
                value: lang.commands.suggestion.channel.description,
              },
              {
                name: lang.example,
                value: `${command.prefix + command.command} channel new ${
                  caller.utils.getRandomElement(
                    command.channels.filter((c) => !c.type),
                  ).mention
                }\n${command.prefix + command.command} channel approved ${
                  caller.utils.getRandomElement(
                    command.channels.filter((c) => !c.type),
                  ).mention
                }\n\n[${lang.guidePage}](https://docs.zira.ovh/${
                  command.command
                })`,
              },
            ],
          },
        });
        return;
      }
      const channel = command.guild.channels.get(
        command.params[2].replace(/\D+/g, ''),
      );
      if (!channel) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            color: caller.color.yellow,
            description: lang.errors.unknownChannel,
          },
        });
        return;
      }
      const type = types[types.indexOf(command.params[1].toLowerCase())];
      guild.suggestion[type] = channel.id;
      caller.utils.updateGuild(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.complete,
          color: caller.color.green,
          description: lang.commands.suggestion.channel.set
            .replace('$type', type.charAt(0).toUpperCase() + type.slice(1))
            .replace('$channel', channel.mention),
        },
      });
      break;
    }
    case 'submit': {
      if (process.env.PREMIUM && !guild.premium) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            description: lang.errors.premium,
            color: caller.color.yellow,
          },
        });
        return;
      }
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
                  lang.commands.suggestion.submit.help,
                value: lang.commands.suggestion.submit.description,
              },
              {
                name: lang.example,
                value: `${command.prefix + command.command} submit new ${
                  caller.utils.getRandomElement(
                    command.channels.filter((c) => !c.type),
                  ).mention
                }\n${command.prefix + command.command} submit approved ${
                  caller.utils.getRandomElement(
                    command.channels.filter((c) => !c.type),
                  ).mention
                }\n\n[${lang.guidePage}](https://docs.zira.ovh/${
                  command.command
                })`,
              },
            ],
          },
        });
        return;
      }
      if (command.params[1] === 'disable') {
        guild.suggestion.submit = null;
        caller.utils.updateGuild(guild);
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.complete,
            color: caller.color.green,
            description: lang.commands.suggestion.submit.disable,
          },
        });
        return;
      }
      const channel = command.guild.channels.get(
        command.params[1].replace(/\D+/g, ''),
      );
      if (!channel) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            color: caller.color.yellow,
            description: lang.errors.unknownChannel,
          },
        });
        return;
      }
      guild.suggestion.submit = channel.id;
      caller.utils.updateGuild(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.complete,
          color: caller.color.green,
          description: lang.commands.suggestion.submit.set.replace(
            '$channel',
            channel.mention,
          ),
        },
      });
      break;
    }
    case 'dm': {
      if (process.env.PREMIUM && !guild.premium) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            description: lang.errors.premium,
            color: caller.color.yellow,
          },
        });
        return;
      }
      guild.suggestion.dm = guild.suggestion.dm !== true;
      caller.utils.updateGuild(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.complete,
          color: caller.color.green,
          description:
            lang.commands.suggestion.dm[guild.suggestion.dm ? 'on' : 'off'],
        },
      });
      break;
    }
    case 'reaction': {
      if (process.env.PREMIUM && !guild.premium) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            description: lang.errors.premium,
            color: caller.color.yellow,
          },
        });
        return;
      }
      guild.suggestion.reaction = guild.suggestion.reaction !== true;
      caller.utils.updateGuild(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.complete,
          color: caller.color.green,
          description:
            lang.commands.suggestion.reaction[
              guild.suggestion.reaction ? 'on' : 'off'
            ],
        },
      });
      break;
    }
    case 'emojis': {
      if (process.env.PREMIUM && !guild.premium) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            description: lang.errors.premium,
            color: caller.color.yellow,
          },
        });
        return;
      }
      if (!command.params[1] || !command.params[2]) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.use,
            color: caller.color.blue,
            fields: [
              {
                name:
                  command.prefix +
                  command.command +
                  lang.commands.suggestion.emojis.help,
                value: lang.commands.suggestion.emojis.description,
              },
              {
                name: lang.example,
                value: `${command.prefix +
                  command.command} emojis :thumbsup: :thumbsdown:\n\n[${
                  lang.guidePage
                }](https://docs.zira.ovh/${command.command})`,
              },
            ],
          },
        });
        return;
      }
      guild.suggestion.emojis = [command.params[1], command.params[2]];
      caller.utils.updateGuild(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.complete,
          color: caller.color.green,
          description: lang.commands.suggestion.emojis.set
            .replace('$emoji1', command.params[1])
            .replace('$emoji2', command.params[2]),
        },
      });
      break;
    }
    case 'role': {
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
                  lang.commands.suggestion.submit.help,
                value: lang.commands.suggestion.submit.description,
              },
              {
                name: lang.example,
                value: `${command.prefix + command.command} submit new ${
                  caller.utils.getRandomElement(
                    command.channels.filter((c) => !c.type),
                  ).mention
                }\n${command.prefix + command.command} submit approved ${
                  caller.utils.getRandomElement(
                    command.channels.filter((c) => !c.type),
                  ).mention
                }\n\n[${lang.guidePage}](https://docs.zira.ovh/${
                  command.command
                })`,
              },
            ],
          },
        });
        return;
      }
      if (command.params[1] === 'disable') {
        guild.suggestion.role = null;
        caller.utils.updateGuild(guild);
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.complete,
            color: caller.color.green,
            description: lang.commands.suggestion.role.disable,
          },
        });
        return;
      }
      const [role] = command.guild.roles.filter(
        (r) => r.id === command.params[1] || r.name.toLowerCase().indexOf(command.params[1].toLowerCase()) !== -1,
      );
      if (!role) {
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.yellow,
            title: lang.titles.error,
            description: lang.errors.unknwonRole,
          },
        });
        break;
      }
      guild.suggestion.role = role.id;
      caller.utils.updateGuild(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.complete,
          color: caller.color.green,
          description: lang.commands.suggestion.role.set.replace(
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
                lang.commands.suggestion.main[0].name,
              value: lang.commands.suggestion.main[0].value,
            },
            {
              name:
                command.prefix +
                command.command +
                lang.commands.suggestion.main[1].name,
              value: lang.commands.suggestion.main[1].value,
            },
            {
              name:
                command.prefix +
                command.command +
                lang.commands.suggestion.main[2].name,
              value: lang.commands.suggestion.main[2].value,
            },
            {
              name:
                command.prefix +
                command.command +
                lang.commands.suggestion.main[3].name,
              value: lang.commands.suggestion.main[3].value,
            },
            {
              name:
                command.prefix +
                command.command +
                lang.commands.suggestion.main[4].name,
              value: lang.commands.suggestion.main[4].value,
            },
            {
              name:
                command.prefix +
                command.command +
                lang.commands.suggestion.main[5].name,
              value: lang.commands.suggestion.main[5].value,
            },
          ],
        },
      });
  }
};

exports.Settings = {
  command: 'suggestion',
  category: 1,
  show: true,
  permissions: ['manageGuild'],
  dm: false,
};
