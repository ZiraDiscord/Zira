'use strict';

exports.Run = async function Run(caller, command, GUILD) {
  if (!command.msg.channel.guild) {
    caller.bot.createMessage(command.msg.channel.id, {
      embed: {
        description: ':warning: This command can\'t be used in DM',
        color: caller.color.yellow,
      },
    }).catch(console.error);
    return;
  }
  const guild = GUILD;
  const lang = caller.utils.getLang(guild);
  if (command.msg.author.id === '160168328520794112' || command.msg.member.hasPermission('MANAGE_GUILD', false, true, true) !== false) {
    if (!command.params[0]) {
      caller.utils.sendMessage(command, {
        embed: {
          title: lang.title,
          color: caller.color.blue,
          description: `**${command.prefix}${lang.log.help[0]}${command.prefix}${lang.log.help[1]}`,
          image: {
            url: lang.log.image,
          },
        },
      });
    } else {
      const channel = (command.params[0] === 'stop') ? 'stop' : caller.bot.channels.get(command.params[0].replace(/\D/g, ''));
      if (channel) {
        if (channel === 'stop') {
          guild.log = '';
          caller.utils.sendMessage(command, {
            embed: {
              title: lang.titleComp,
              description: lang.log.stop,
              color: caller.color.green,
            },
          });
          caller.utils.updateGuild(guild);
        } else {
          guild.log = channel.id;
          caller.utils.sendMessage(command, {
            embed: {
              title: lang.titleComp,
              description: lang.log.set[0] + guild.log + lang.log.set[1],
              color: caller.color.green,
            },
          });
          caller.utils.updateGuild(guild);
        }
      } else {
        caller.utils.sendMessage(command, {
          embed: {
            title: lang.titleError,
            description: lang.unknownChannel,
            color: caller.color.yellow,
          },
        });
      }
    }
  } else {
    caller.utils.sendMessage(command, {
      embed: {
        title: lang.titleError,
        description: lang.perm.noGuildPerm,
        color: caller.color.yellow,
      },
    });
  }
};

exports.Settings = function Settings() {
  return {
    show: true,
    category: 'logs',
  };
};
