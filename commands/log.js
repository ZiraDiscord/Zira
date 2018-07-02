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
          title: lang.title,
          color: caller.color.blue,
          description: `**${command.prefix}${lang.log.help[0]}${command.prefix}${lang.log.help[1]}\n\n[${lang.guide}](https://zira.pw/guide/log)`,
        },
      }).catch(console.error);
    } else {
      const channel = (command.params[0] === 'stop') ? 'stop' : command.msg.channel.guild.channels.get(command.params[0].replace(/\D/g, ''));
      if (channel) {
        if (channel === 'stop') {
          guild.log = '';
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              description: lang.log.stop,
              color: caller.color.green,
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
        } else {
          guild.log = channel.id;
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              description: lang.log.set[0] + guild.log + lang.log.set[1],
              color: caller.color.green,
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
        }
      } else {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.unknownChannel,
            color: caller.color.yellow,
          },
        }).catch(console.error);
      }
    }
  } else {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        title: lang.titleError,
        description: lang.perm.noGuildPerm,
        color: caller.color.yellow,
      },
    }).catch(console.error);
  }
};

exports.Settings = function Settings() {
  return {
    show: true,
    category: 'logs',
  };
};
