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
  if (!command.params[0]) {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        color: caller.color.blue,
        title: lang.title,
        description: `**${command.prefix}${lang.submit.help}`,
      },
    }).catch(console.error);
    return;
  }
  const channel = command.msg.channel.guild.channels.get(guild.suggestion);
  if (channel) {
    if (guild.submitChannel) {
      if (guild.submitChannel !== command.msg.channel.id) {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            color: caller.color.yellow,
            description: lang.suggestion.useChannel[0] + guild.submitChannel + lang.suggestion.useChannel[1],
          },
        }).then((m) => {
          setTimeout(() => {
            if (command.msg.channel.guild.members.get(caller.bot.user.id).permission.has('manageMessages')) command.msg.delete().catch(console.error);
            m.delete().catch(console.error);
          }, 5000);
        }).catch(console.error);
        return;
      }
    }
    let card;
    if (guild.trello && guild.trello.enabled) {
      card = await caller.trello.addCard(`${command.msg.author.username}#${command.msg.author.discriminator}`, command.params.join(' '), guild.trello.list);
    }
    if (typeof card === 'string') card = undefined; // cause appearntly the creator of the trello package doesnt believe in rejecting errors
    let message;
    const id = Math.random().toString(36).substr(2, 5);
    try {
      const embed = {
        author: {
          name: `${command.msg.author.username}#${command.msg.author.discriminator}`,
          icon_url: command.msg.author.avatarURL,
        },
        color: caller.color.blue,
        fields: [{
          name: lang.submit.title,
          value: command.params.join(' '),
        }],
        footer: {
          text: `ID: ${id}`,
        },
      };
      if (card) {
        embed.title = 'Trello';
        embed.url = card.shortUrl;
      }
      message = await caller.bot.createMessage(guild.suggestion, {
        embed,
      });
    } catch (e) {
      caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
      guild.suggestion = '';
      caller.utils.updateGuild(guild);
      return;
    }
    if (command.msg.channel.guild.members.get(caller.bot.user.id).permission.has('addReactions')) {
      await caller.bot.addMessageReaction(guild.suggestion, message.id, '⬆').catch(console.error);
      await caller.bot.addMessageReaction(guild.suggestion, message.id, '⬇').catch(console.error);
    }
    if (!guild.suggestions) guild.suggestions = [];
    guild.suggestions.push({
      user: command.msg.author.id,
      suggestion: command.params.join(' '),
      message: message.id,
      id,
      trello: (card) ? card.shortUrl : null,
      channel: guild.suggestion,
    });
    caller.utils.updateGuild(guild);
    if (command.msg.channel.guild.members.get(caller.bot.user.id).permission.has('manageMessages')) caller.bot.deleteMessage(command.msg.channel.id, command.msg.id).catch(console.error);
  }
};

exports.Settings = function Settings() {
  return {
    show: true,
    category: 'suggestion',
  };
};
