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
    if (!command.params[0] || !command.params[1]) {
      caller.bot.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          title: lang.title,
          description: `**${command.prefix}${lang.edit.help}\n\n${lang.example}${command.prefix}edit ${command.msg.id} Some new message\n`,
        },
      }).catch(console.error);
      return;
    }

    try {
      await caller.bot.editMessage(guild.chan, command.params[0], command.params.splice(1).join(' '));
    } catch (e) {
      caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
      if (e.code === 50001) {
        caller.bot.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.edit.read[0] + guild.chan + lang.edit.read[1],
            color: caller.color.yellow,
          },
        }).catch(console.error);
      } else if (e.code === 10008) {
        caller.bot.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: `${lang.edit.unknownGet}${guild.chan}>`,
            color: caller.color.yellow,
          },
        }).catch(console.error);
      } else if (e.code === 50005) {
        caller.bot.createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.edit.no,
            color: caller.color.yellow,
          },
        }).catch(console.error);
      }
      return;
    }
    caller.bot.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.titleComp,
        description: lang.edit.edited,
        color: caller.color.green,
      },
    }).catch(console.error);
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
