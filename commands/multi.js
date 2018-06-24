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
  const member = command.msg.channel.guild.members.get(command.msg.author.id);
  if (command.msg.author.id === process.env.OWNER || member.permission.has('manageRoles')) {
    if (!command.params[0] || !command.params[1] || !command.params[2]) {
      const ROLES = command.msg.channel.guild.roles.filter(r => r.id !== command.msg.channel.guild.id);
      caller.bot.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          title: lang.title,
          description: `**${command.prefix}${lang.multi.help}\n\n${lang.example}${command.prefix}multi :information_source:, Updates, <@&${ROLES[caller.utils.randomNumber(0, ROLES.length - 1)].id}>\n${command.prefix}multi :information_source:, Updates, <@&${ROLES[caller.utils.randomNumber(0, ROLES.length - 1)].id}>, <@&${ROLES[caller.utils.randomNumber(0, ROLES.length - 1)].id}>`,
        },
      }).catch(console.error);
      return;
    }
    if (!guild.chan) {
      caller.bot.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titleError,
          description: lang.noChannel[0] + command.prefix + lang.noChannel[1],
          color: caller.color.yellow,
        },
      }).catch(console.error);
      return;
    }
    if (!guild.emoji || !guild.msgid.length) {
      caller.bot.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titleError,
          description: lang.noMessage[0] + command.prefix + lang.noMessage[1],
          color: caller.color.yellow,
        },
      }).catch(console.error);
      return;
    }
    const Params = command.params.join(' ').split(', ');
    Params.forEach((item, index) => {
      if (item.indexOf('<@&') !== -1) Params[index] = item.replace(/\D+/g, '');
    });
    console.log(Params);
    const roles = [];
    for (let i = 0; i < Params.length; i++) {
      if (i) {
        // eslint-disable-next-line no-loop-func
        const [role] = command.msg.channel.guild.roles.filter(r => r.id === Params[i] || r.name.toLowerCase().indexOf(Params[i].toLowerCase()) !== -1);
        if (!role) {
          caller.bot.createMessage(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.unknownRole[0] + caller.utils.ordinalSuffix(i + 1) + lang.unknownRole[1],
              color: caller.color.yellow,
            },
          }).catch(console.error);
          return;
        }
        roles.push(role.id);
      }
    }
    let emojiFree = true;
    for (let r = 0; r < guild.roles.length; r++) {
      if (guild.roles[r].msg === guild.emoji) {
        if (guild.roles[r].emoji === Params[0]) emojiFree = false;
      }
    }
    if (!emojiFree) {
      caller.bot.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titleError,
          description: lang.add.emoji[0] + Params[0] + lang.add.emoji[1],
          color: caller.color.yellow,
        },
      }).catch(console.error);
      return;
    }
    try {
      await caller.bot.addMessageReaction(guild.chan, guild.emoji, Params[0].replace(/(<:)|(<)|(>)/g, ''));
    } catch (e) {
      caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
      if (e.code === 50001) {
        caller.bot.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.add.cannotRead[0] + Params[0] + lang.add.cannotRead[1] + guild.chan + lang.add.cannotRead[2],
            color: caller.color.yellow,
          },
        }).catch(console.error);
      } else if (e.code === 50013) {
        caller.bot.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.add.cannotReact[0] + Params[0] + lang.add.cannotReact[1] + guild.chan + lang.add.cannotReact[2],
            color: caller.color.yellow,
          },
        }).catch(console.error);
      } else if (e.code === 10014) {
        caller.bot.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.unknownEmoji[0] + caller.utils.ordinalSuffix(1) + lang.unknownEmoji[1],
            color: caller.color.yellow,
          },
        }).catch(console.error);
      } else {
        caller.bot.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: `${lang.add.unknown[0]}${Params[0]}${lang.add.unknown[1]}${guild.chan}>`,
            color: caller.color.yellow,
          },
        }).catch(console.error);
      }
      return;
    }
    let message = '';
    roles.forEach((id, index) => {
      message += `<@&${id}>${(index === roles.length - 1) ? ' ' : ', '}`;
    });
    guild.roles.push({
      ids: roles,
      name: message,
      emoji: Params[0],
      msg: guild.emoji,
      channel: guild.chan,
      multi: true,
    });
    caller.bot.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.titleComp,
        description: message + lang.multi.set[0] + Params[0] + lang.multi.set[1],
        color: caller.color.green,
      },
    }).catch(console.error);
    caller.utils.updateGuild(guild);
  } else {
    caller.bot.createMessage(command.msg.channel.id, {
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
