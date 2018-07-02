'use strict';

exports.Run = async function Run(caller, command, GUILD) {
  if (!command.msg.channel.guild) {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        description: ':warning: This command can\'t be used in DM',
        color: caller.color.yellow,
      },
    }).catch(console.error);
    return;
  }
  const guild = GUILD;
  const lang = caller.utils.getLang(guild);
  if (command.msg.author.id === process.env.OWNER || command.msg.member.permission.has('manageRoles')) {
    if (!command.params[0]) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          title: lang.title,
          description: `**${command.prefix}${lang.message.help}\n\n${lang.example}${command.prefix}message ${command.msg.id}\n${command.prefix}message React with :information_source: to get updates.\n[${lang.guide}](https://zira.pw/guide/channel)`,
        },
      }).catch(console.error);
      return;
    }
    if (!guild.chan) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          title: lang.titleError,
          description: lang.noChannel[0] + command.prefix + lang.noChannel[1],
          color: caller.color.yellow,
        },
      }).catch(console.error);
      return;
    }
    const channel = command.msg.channel.guild.channels.get(guild.chan);
    let message;
    if (!command.params[1] && !isNaN(command.params[0])) {
      try {
        message = await channel.getMessage(command.params[0]);
      } catch (e) {
        caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
        if (e.code === 50001) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.message.cannotReadID[0] + channel.id + lang.message.cannotReadID[1],
              color: caller.color.yellow,
            },
          }).catch(console.error);
        } else {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.message.unknownID,
              color: caller.color.yellow,
            },
          }).catch(console.error);
        }
        return;
      }
    } else {
      try {
        message = await caller.bot.createMessage(channel.id, command.params.join(' '));
      } catch (e) {
        caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
        if (e.code === 50013) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.message.cannotSend[0] + channel.id + lang.message.cannotSend[1],
              color: caller.color.yellow,
            },
          }).catch(console.error);
        } else if (e.code === 50001) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.message.cannotRead[0] + channel.id + lang.message.cannotRead[1],
              color: caller.color.yellow,
            },
          }).catch(console.error);
        } else {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.message.unknown,
              color: caller.color.yellow,
            },
          }).catch(console.error);
        }
      }
    }
    if (guild.msgid.indexOf(message.id) === -1) {
      guild.msgid.push(message.id);
    }
    guild.emoji = message.id;
    caller.utils.message(command.msg.channel.id, {
      embed: {
        title: lang.titleComp,
        description: lang.message.set + message.id,
        color: caller.color.green,
      },
    }).catch(console.error);
    caller.utils.updateGuild(guild);
  } else {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        title: lang.titleError,
        description: lang.perm.noPerm,
        color: caller.color.yellow,
      },
    }).catch(console.error);
  }
};

exports.Settings = function Settings() {
  return {
    show: true,
    category: 'role',
  };
};
