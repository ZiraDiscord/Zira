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
  const lang = caller.utils.getLang(guild.lang);
  if (command.msg.author.id === process.env.OWNER || command.msg.member.permission.has('manageGuild')) {
    if (!command.params[0]) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          title: lang.title,
          color: caller.color.blue,
          description: `**${command.prefix}${lang.prefix.help}`,
        },
      });
      return;
    }
    const prefix = command.params.join(' ');
    if (prefix.length < 1 || prefix.length > 10) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          title: lang.titleError,
          description: lang.prefix.error,
          color: caller.color.yellow,
        },
      });
      return;
    }
    guild.prefix = prefix;
    caller.utils.message(command.msg.channel.id, {
      embed: {
        title: lang.titleComp,
        description: lang.prefix.set + guild.prefix,
        color: caller.color.green,
      },
    });
    caller.utils.updateGuild(guild);
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
    category: 'misc',
  };
};
