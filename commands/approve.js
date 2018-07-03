'use strict';

const snekfetch = require('snekfetch'); // eslint-disable-line

exports.Run = async function Run(caller, command, GUILD) {
  if (!command.msg.channel.guild) {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        description: ':warning: This command can\'t be used in DM',
        color: caller.color.yellow,
      },
    });
    return;
  }
  const guild = GUILD;
  const lang = caller.utils.getLang(guild.lang);
  if (command.msg.author.id === process.env.OWNER || command.msg.member.permission.has('manageGuild') || command.msg.member.roles.indexOf(guild.suggestionRole) !== -1) {
    if (!command.params[0]) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          title: lang.title,
          description: `**${command.prefix}${lang.approve.help}\n\n${lang.example}${command.prefix}approve ${command.msg.id} Great idea.\n${command.prefix}approve ${Math.random().toString(36).substr(2, 5)} This will be added soon.`,
        },
      });
      return;
    }
    if (!guild.suggestion) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          color: caller.color.yellow,
          title: lang.titleError,
          description: lang.suggestion.disable,
        },
      });
      return;
    }
    const id = (guild.suggestions.filter(s => s.id === command.params[0]).length) ? guild.suggestions.filter(s => s.id === command.params[0])[0].message : command.params[0];
    let message;
    try {
      message = await caller.bot.getMessage(guild.suggestion, id);
    } catch (e) {
      caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
      if (e.code === 50013) {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.approve.read[0] + guild.suggestion + lang.approve.read[1],
            color: caller.color.yellow,
          },
        });
        guild.suggestion = '';
        caller.utils.updateGuild(guild);
      } else if (e.code === 10008) {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.unknownMessage,
            color: caller.color.yellow,
          },
        });
      } else {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.approve.unknown,
            color: caller.color.yellow,
          },
        });
      }
      return;
    }
    if (!message.embeds[0] || message.author.id !== caller.bot.user.id) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          title: lang.titleError,
          description: lang.suggestion.notSetup,
          color: caller.color.yellow,
        },
      });
      return;
    }
    const embed = message.embeds[0];
    const reason = (command.params[1]) ? command.params.splice(1).join(' ') : lang.suggestion.noReason;
    if (embed.description) {
      embed.title = lang.approve.title;
      embed.color = caller.color.green;
      embed.fields = [{
        name: lang.suggestion.reason + command.msg.author.username,
        value: reason,
      }];
    } else {
      embed.color = caller.color.green;
      embed.fields = [{
        name: lang.approve.title,
        value: embed.fields[0].value,
      }, {
        name: lang.suggestion.reason + command.msg.author.username,
        value: reason,
      }];
    }
    if (guild.moveChannel) {
      try {
        caller.utils.message(guild.moveChannel, {
          embed,
        });
      } catch (e) {
        caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
        guild.moveChannel = '';
        caller.utils.updateGuild(guild);
      }
    }
    caller.bot.editMessage(guild.suggestion, message.id, {
      embed,
    }).catch(console.error);
    if (command.msg.channel.guild.members.get(caller.bot.user.id).permission.has('manageMessages')) caller.bot.deleteMessage(command.msg.channel.id, command.msg.id).catch(console.error);
    const [suggestion] = guild.suggestions.filter(s => s.message === id);
    if (suggestion && guild.suggestionDM) {
      const channel = await caller.bot.getDMChannel(suggestion.user);
      caller.utils.message(channel.id, lang.approve.dm.replace('$USER', command.msg.author.username).replace('$SUGGESTION', suggestion.suggestion).replace('$REASON', reason));
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
    category: 'suggestion',
  };
};
