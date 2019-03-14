'use strict';

const ShortUniqueId = require('short-unique-id');

const uid = new ShortUniqueId();

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  if (!command.params[0]) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.blue,
        title: lang.titles.use,
        fields: [
          {
            name:
              command.prefix + command.command + lang.commands.submit.params,
            value: lang.commands.submit.help,
          },
        ],
      },
    });
    return;
  }
  if (!guild.suggestion.new) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.commands.submit.noChannel,
      },
    });
    return;
  }
  if (guild.suggestion.submit && command.msg.channel.id !== guild.suggestion.submit) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.commands.submit.wrongChannel.replace(
          '$channel',
          guild.suggestion.submit,
        ),
      },
    });
    return;
  }
  const suggestion = {
    author: {
      username: command.msg.author.username,
      id: command.msg.author.id,
      discriminator: command.msg.author.discriminator,
      avatar: command.msg.author.avatarURL,
    },
    content: command.params.join(' '),
    reason: null,
    state: 'new',
    id: uid.randomUUID(4),
    message: '',
    channel: guild.suggestion.new,
    trello: null,
  };

  if (guild.trello.enabled && guild.trello.new) {
    let card = await caller.trello.addCard(
      lang.commands.submit.card.title.replace(
        '$suggestion',
        command.params.join(' ').substring(0, 31),
      ),
      lang.commands.submit.card.body
        .replace('$suggestion', command.params.join(' '))
        .replace(
          '$user',
          `${command.msg.author.username}#${command.msg.author.discriminator}`,
        ),
      guild.trello.new.id,
    );
    if (typeof card === 'string') card = undefined;
    if (card) suggestion.trello = card.id;
  }

  let message;
  try {
    message = await caller.bot.createMessage(guild.suggestion.new, {
      embed: {
        color: caller.color.blue,
        author: {
          name: command.msg.author.username,
          icon_url: command.msg.author.avatarURL,
        },
        description: suggestion.trello
          ? `[Trello](https://trello.com/c/${suggestion.trello})`
          : null,
        fields: [
          {
            name: lang.suggestion.new,
            value: command.params.join(' '),
          },
        ],
        footer: {
          text: `ID: ${suggestion.id}  ${lang.suggestion.submitted}`,
        },
        timestamp: new Date(),
      },
    });
  } catch (e) {
    caller.logger.warn(
      `[Submit] ${command.msg.channel.id} ${e.code} ${e.message.replace(
        /\n\s/g,
        '',
      )}`,
    );
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.errors.generic,
      },
    });
  }
  suggestion.message = message.id;
  guild.suggestions.push(suggestion);
  await caller.utils.updateGuild(guild);
  if (guild.suggestion.reaction) {
    let failed = false;
    for (let index = 0; index < guild.suggestion.emojis.length; index += 1) {
      if (failed) break;
      await message
        .addReaction(
          guild.suggestion.emojis[index].replace(/(<:)|(<)|(>)/g, ''),
        )
        .catch((error) => {
          if (error.code === 50001) failed = true;
        });
    }
  }
  command.msg.delete().catch(() => {});
  caller.bot
    .createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.green,
        title: lang.titles.complete,
        description: lang.commands.submit.success,
      },
    })
    .then((m) => {
      setTimeout(() => m.delete(), 5000);
    })
    .catch(caller.logger.warn);
};

exports.Settings = {
  command: 'submit',
  category: 1,
  show: true,
  permissions: [],
  dm: false,
};
