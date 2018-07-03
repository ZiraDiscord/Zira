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
    switch (command.params[0]) {
    case 'channel':
      {
        if (!command.params[1]) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.title,
              description: `**${command.prefix}${lang.leave.channel[0]}${command.prefix}${lang.leave.channel[1]}`,
              color: caller.color.blue,
            },
          });
          return;
        }
        const channel = (command.params[1] === 'stop') ? 'stop' : command.msg.channel.guild.channels.get(command.params[1].replace(/\D/g, ''));
        if (channel) {
          if (channel === 'stop') {
            guild.leaveChannel = '';
            caller.utils.message(command.msg.channel.id, {
              embed: {
                title: lang.titleComp,
                description: lang.leave.stop,
                color: caller.color.green,
              },
            });
            caller.utils.updateGuild(guild);
          } else {
            guild.leaveChannel = channel.id;
            caller.utils.message(command.msg.channel.id, {
              embed: {
                title: lang.titleComp,
                description: lang.leave.setChannel[0] + guild.leaveChannel + lang.leave.setChannel[1],
                color: caller.color.green,
              },
            });
            caller.utils.updateGuild(guild);
          }
        } else {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.unknownChannel,
              color: caller.color.yellow,
            },
          });
        }
        break;
      }
    case 'message':
      {
        if (!command.params[1]) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.title,
              description: `**${command.prefix}${lang.leave.message}\n\n${lang.example}${command.prefix}leave message $user left :eyes:`,
              color: caller.color.blue,
            },
          });
          return;
        }
        const message = command.params.splice(1).join(' ');
        guild.leaveMessage = message;
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleComp,
            description: lang.leave.setMessage + guild.leaveMessage,
            color: caller.color.green,
          },
        });
        caller.utils.updateGuild(guild);
        break;
      }
    default:
      caller.utils.message(command.msg.channel.id, {
        embed: {
          title: lang.leave.title,
          description: `**${command.prefix}${lang.leave.help[0]}${command.prefix}${lang.leave.help[1]}\n\n[${lang.guide}](https://zira.pw/guide/leave)`,
          color: caller.color.blue,
        },
      });
    }
  } else {
    caller.utils.message(command.msg.channel.id, {
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
