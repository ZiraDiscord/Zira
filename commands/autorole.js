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
    if (typeof guild.user === 'undefined') {
      guild.user = [];
    }
    if (typeof guild.bot === 'undefined') {
      guild.bot = [];
    }
    if (typeof guild.user === 'string') {
      guild.user = [guild.user];
    }
    if (typeof guild.bot === 'string') {
      guild.bot = [guild.bot];
    }
    switch (command.params[0]) {
    case 'user':
      {
        if (!command.params[1]) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.title,
              color: caller.color.blue,
              description: `**${command.prefix}${lang.auto.user}`,
            },
          }).catch(console.error);
          return;
        }
        let guildrole;
        if (command.params[1].indexOf('<@&') !== -1 || isNaN(command.params[1]) === false) {
          [guildrole] = command.msg.channel.guild.roles.filter(r => r.id === command.params[1].replace(/\D/g, ''));
        } else {
          const rolename = command.params.splice(1).join(' ').toLowerCase();
          [guildrole] = command.msg.channel.guild.roles.filter(m => m.name.toLowerCase() === rolename);
        }
        if (!guildrole) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              color: caller.color.yellow,
              description: lang.delete.unknown,
            },
          }).catch(console.error);
          return;
        }
        if (guild.user.indexOf(guildrole.id) !== -1) {
          const old = guild.user[guild.user.indexOf(guildrole.id)];
          guild.user.splice(guild.user.indexOf(guildrole.id), 1);
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              color: caller.color.green,
              description: lang.auto.userRemove[0] + old + lang.auto.userRemove[1],
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
        } else {
          guild.user.push(guildrole.id);
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              color: caller.color.green,
              description: lang.auto.userAdd[0] + guildrole.id + lang.auto.userAdd[1],
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
        }
        break;
      }
    case 'bot':
      {
        if (!command.params[1]) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.title,
              color: caller.color.blue,
              description: `**${command.prefix}${lang.auto.bot}`,
            },
          }).catch(console.error);
          return;
        }
        let guildrole;
        if (command.params[1].indexOf('<@&') !== -1 || isNaN(command.params[1]) === false) {
          [guildrole] = command.msg.channel.guild.roles.filter(r => r.id === command.params[1].replace(/\D/g, ''));
        } else {
          const rolename = command.params.splice(1).join(' ').toLowerCase();
          [guildrole] = command.msg.channel.guild.roles.filter(m => m.name.toLowerCase() === rolename);
        }
        if (!guildrole) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              color: caller.color.yellow,
              description: lang.delete.unknown,
            },
          }).catch(console.error);
          return;
        }
        if (guild.bot.indexOf(guildrole.id) !== -1) {
          const old = guild.bot[guild.bot.indexOf(guildrole.id)];
          guild.bot.splice(guild.bot.indexOf(guildrole.id), 1);
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              color: caller.color.green,
              description: lang.auto.botRemove[0] + old + lang.auto.botRemove[1],
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
        } else {
          guild.bot.push(guildrole.id);
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              color: caller.color.green,
              description: lang.auto.botAdd[0] + guildrole.id + lang.auto.botAdd[1],
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
        }
        break;
      }
    case 'show':
      {
        let user = (guild.user[0]) ? '' : lang.auto.no;
        let bot = (guild.bot[0]) ? '' : lang.auto.no;
        guild.user.forEach((id) => {
          user += `<@&${id}>\n`;
        });
        guild.bot.forEach((id) => {
          bot += `<@&${id}>\n`;
        });
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.auto.title,
            color: caller.color.blue,
            fields: [{
              name: lang.auto.showUser,
              value: user,
            }, {
              name: lang.auto.showBot,
              value: bot,
            }],
          },
        }).catch(console.error);
        break;
      }
    default:
      caller.utils.message(command.msg.channel.id, {
        embed: {
          title: lang.auto.title,
          description: `**${command.prefix}${lang.auto.help[0]}${command.prefix}${lang.auto.help[1]}${command.prefix}${lang.auto.help[2]}`,
          color: caller.color.blue,
        },
      }).catch(console.error);
    }
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
