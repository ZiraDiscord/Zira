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
    if (!command.params[0] || !command.params[1]) {
      const ROLES = command.msg.channel.guild.roles.filter(r => r.id !== command.msg.channel.guild.id);
      caller.utils.message(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          title: lang.title,
          description: `**${command.prefix}${lang.toggle.help}\n\n${lang.example}${command.prefix}toggle :information_source: Updates\n${command.prefix}toggle :information_source: Updates, <:thirp:450747331512369152> <@&${ROLES[caller.utils.randomNumber(0, ROLES.length - 1)].id}>\n[${lang.guide}](https://zira.pw/guide/toggle)`,
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
    if (!guild.emoji || !guild.msgid.length) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          title: lang.titleError,
          description: lang.noMessage[0] + command.prefix + lang.noMessage[1],
          color: caller.color.yellow,
        },
      }).catch(console.error);
      return;
    }
    const Params = caller.utils.parseParams(command.params);
    if ((toggleCount + Params.length) > 11) {
      if (!guild.premium && toggleCount > 11 && process.env.PREMIUM) {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.toggle.before,
            color: caller.color.yellow,
          },
        }).catch(console.error);
        return;
      }
    }
    const Added = [];
    let count = 0;
    for (const param of Params) {
      count++;
      // eslint-disable-next-line no-loop-func
      const [role] = command.msg.channel.guild.roles.filter(r => r.id === param[1] || r.name.toLowerCase().indexOf(param[1].toLowerCase()) !== -1);
      if (!role) {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.unknownRole[0] + caller.utils.ordinalSuffix(count) + lang.unknownRole[1],
            color: caller.color.yellow,
          },
        }).catch(console.error);
        break;
      }
      let emojiFree = true;
      let roleFree = true;
      for (let r = 0; r < guild.roles.length; r++) {
        if (guild.roles[r].msg === guild.emoji) {
          if (guild.roles[r].emoji === param[0]) emojiFree = false;
          if (guild.roles[r].id === role.id) roleFree = false;
        }
      }
      if (!emojiFree) {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.add.emoji[0] + param[0] + lang.add.emoji[1],
            color: caller.color.yellow,
          },
        }).catch(console.error);
        break;
      }
      if (!roleFree) {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.add.role[0] + role.id + lang.add.role[1],
            color: caller.color.yellow,
          },
        }).catch(console.error);
        break;
      }
      let res;
      try {
        console.log(param);
        res = await caller.bot.addMessageReaction(guild.chan, guild.emoji, param[0].replace(/(<:)|(<)|(>)/g, ''));
      } catch (e) {
        caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
        if (e.code === 50001) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.add.cannotRead[0] + param[0] + lang.add.cannotRead[1] + guild.chan + lang.add.cannotRead[2],
              color: caller.color.yellow,
            },
          }).catch(console.error);
        } else if (e.code === 50013) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.add.cannotReact[0] + param[0] + lang.add.cannotReact[1] + guild.chan + lang.add.cannotReact[2],
              color: caller.color.yellow,
            },
          }).catch(console.error);
        } else if (e.code === 10014) {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.unknownEmoji[0] + caller.utils.ordinalSuffix(count) + lang.unknownEmoji[1],
              color: caller.color.yellow,
            },
          }).catch(console.error);
        } else {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: `${lang.add.unknown[0]}${param[0]}${lang.add.unknown[1]}${guild.chan}>`,
              color: caller.color.yellow,
            },
          }).catch(console.error);
        }
        break;
      }
      console.log(res);
      Added.push({
        id: role.id,
        emoji: param[0],
      });
      guild.roles.push({
        id: role.id,
        name: role.name,
        emoji: param[0],
        msg: guild.emoji,
        channel: guild.chan,
        toggle: true,
      });
    }
    let description = '';
    Added.forEach((obj) => {
      description += lang.add.set[0] + obj.id + lang.add.set[1] + obj.emoji;
    });
    if (description) {
      description += lang.add.set[2];
      caller.utils.message(command.msg.channel.id, {
        embed: {
          title: lang.titleComp,
          description,
          color: caller.color.green,
        },
      }).catch(console.error);
      caller.utils.updateGuild(guild);
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
