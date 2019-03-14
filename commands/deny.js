'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  if (guild.suggestion.role && command.msg.member.roles.indexOf(guild.suggestion.role) === -1) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.titles.error,
        color: caller.color.yellow,
        description: lang.errors.suggestionRole.replace('$role', guild.suggestion.role),
      },
    });
    return;
  }
  if (!command.params[0]) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.titles.error,
        color: caller.color.yellow,
        description: lang.errors.suggestionID,
      },
    });
    return;
  }
  const [suggestion] = guild.suggestions.filter(
    (s) => s.message === command.params[0] || s.id === command.params[0],
  );
  let index;
  guild.suggestions.forEach((s, i) => {
    if (s.message === command.params[0] || s.id === command.params[0]) {
      index = i;
    }
  });
  if (!suggestion) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.titles.error,
        color: caller.color.yellow,
        description: lang.errors.unknownSuggestion,
      },
    });
    return;
  }
  let oldSuggestion;
  try {
    oldSuggestion = await caller.bot.getMessage(
      suggestion.channel,
      suggestion.message,
    );
  } catch (e) {
    caller.logger.warn(
      `[Deny] ${command.msg.channel.id} ${e.code} ${e.message.replace(
        /\n\s/g,
        '',
      )}`,
    );
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.errors.suggestionRead
          .replace('$suggestion', command.params[0])
          .replace('$channel', suggestion.channel),
      },
    });
    return;
  }
  const embed = oldSuggestion.embeds[0];
  embed.color = caller.color.red;
  embed.fields[0].name = lang.suggestion.denied;
  if (command.params[1]) {
    embed.fields[1] = {
      name: lang.suggestion.reason,
      value: command.params.slice(1).join(' '),
    };
  }

  const channel = guild.suggestion.denied
    ? command.channels.get(guild.suggestion.denied)
    : null;

  if (guild.suggestion.denied === suggestion.channel && channel) {
    try {
      await oldSuggestion.edit({ embed });
    } catch (e) {
      caller.logger.warn(e);
      return;
    }
  } else if (channel) {
    let newSuggestion;
    try {
      newSuggestion = await caller.bot.createMessage(channel.id, { embed });
    } catch (e) {
      caller.logger.warn(
        `[Deny] ${command.msg.channel.id} ${e.code} ${e.message.replace(
          /\n\s/g,
          '',
        )}`,
      );
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.yellow,
          title: lang.titles.error,
          description: lang.error.suggestionSend.replace('$channel', channel.mention),
        },
      });
      return;
    }
    await oldSuggestion.delete().catch(caller.logger.warn);
    suggestion.channel = channel.id;
    suggestion.message = newSuggestion.id;
  } else await oldSuggestion.edit({ embed }).catch(caller.logger.warn);

  suggestion.state = 'denied';
  suggestion.reason = command.params[1]
    ? command.params.slice(1).join(' ')
    : null;

  guild.suggestions[index] = suggestion;
  await caller.utils.updateGuild(guild);
  const user = caller.bot.users.get(suggestion.author.id);
  if (user && guild.suggestion.dm) {
    const dm = await user.getDMChannel();
    dm.createMessage(command.params[1] ? lang.suggestion.deniedMessageReason.replace('$suggestion', suggestion.content).replace('$reason', command.params.slice(1).join(' ')) : lang.suggestion.deniedMessage.replace('$suggestion',
    suggestion.content)).catch(caller.logger.warn);
  }
  if (suggestion.trello && guild.trello.enabled && guild.trello.denied) {
    await caller.trello.updateCardName(
      suggestion.trello,
      `${lang.suggestion.denied}: ${suggestion.content.substring(0, 31)}`,
    );
    await caller.trello.updateCardDescription(
      suggestion.trello,
      `${suggestion.content}\n\n${lang.suggestion.submittedBy} ${suggestion.author.username}#${
        suggestion.author.discriminator
      }\n\n${lang.suggestion.reason}: ${suggestion.reason ? suggestion.reason : lang.suggestion.noReason}`,
    );
    await caller.trello.updateCardList(
      suggestion.trello,
      guild.trello.denied.id,
    );
  }
  command.msg.delete().catch(() => {});
  caller.bot
    .createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.green,
        title: lang.titles.complete,
        description: lang.commands.deny.success,
      },
    })
    .then((message) => {
      setTimeout(() => message.delete(), 5000);
    })
    .catch(caller.logger.warn);
};

exports.Settings = {
  command: 'deny',
  category: 1,
  show: true,
  permissions: ['manageGuild'],
  dm: false,
};
