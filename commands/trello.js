'use strict';

const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  if (process.env.PREMIUM && !guild.premium) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.titles.error,
        description: lang.errors.premium,
        color: caller.color.yellow,
      },
    });
    return;
  }
  if (!command.params[0]) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.titles.error,
        description: lang.commands.trello.supplyBoard,
        color: caller.color.yellow,
      },
    });
    return;
  }
  if (command.params[0] === 'toggle') {
    if (!guild.trello.board) {
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          title: lang.titles.error,
          description: lang.commands.trello.setBoard,
          color: caller.color.yellow,
        },
      });
      return;
    }
    guild.trello.enabled = guild.trello.enabled !== true;
    await caller.utils.updateGuild(guild);
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.green,
        title: lang.titles.complete,
        description: `The trello feature is now ${
          guild.trello.enabled ? 'enabled.' : 'disabled.'
        }`,
      },
    });
    return;
  }
  const boards = await caller.trello.getBoards(process.env.TRELLO_ID);
  if (!_.find(boards, { shortLink: command.params[0] })) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        title: lang.commands.trello.boardNotFound.title,
        description: lang.commands.trello.boardNotFound.description,
        color: caller.color.yellow,
      },
    });
    return;
  }

  const lists = _.filter(
    await caller.trello.getListsOnBoard(command.params[0]),
    {
      closed: false,
    },
  );
  const random = Math.random()
    .toString(36)
    .substr(2, 5);
  let state = 0; // 0 verify 1 new 2 approved 3 denied 4 potential 5 invalid
  if (guild.trello.board) {
    state = 1;
    let description = lang.commands.trello.pickNew;
    lists.forEach((list) => {
      description += `${_.findIndex(lists, list)}. ${list.name}\n`;
    });
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        description,
        color: caller.color.blue,
        title: lang.commands.trello.pickNewTitle,
      },
    });
  } else {
    const DM = await caller.bot.users.get(command.msg.author.id).getDMChannel();
    caller.utils
      .createMessage(DM.id, `Your trello ID is ${random}`)
      .then(async () => {
        caller.utils.createMessage(
          command.msg.channel.id,
          lang.commands.trello.dm.success,
        );
      })
      .catch((e) => {
        caller.logger.error(e);
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.red,
            title: lang.titles.error,
            description: lang.commands.trello.dm.error,
          },
        });
      });
  }

  let timer;
  const handler = async (message) => {
    if (
      message.author.id === command.msg.author.id &&
      message.channel.id === command.msg.channel.id
    ) {
      if (message.content === 'done' && state === 0) {
        const cards = await caller.trello.getCardsOnBoard(command.params[0]);
        const card = _.find(cards, { name: random });
        if (!card) {
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.commands.trello.noCard,
            },
          });
          caller.bot.off('messageCreate', handler);
          clearTimeout(timer);
          return;
        }
        let description = lang.commands.trello.pickNew;
        lists.forEach((list) => {
          description += `${_.findIndex(lists, list)}. ${list.name}\n`;
        });
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            description,
            color: caller.color.blue,
            title: lang.commands.trello.pickNewTitle,
          },
        });
        state = 1;
        [guild.trello.board] = command.params;
        clearTimeout(timer);
        timer = setTimeout(() => {
          caller.bot.off('messageCreate', handler);
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.commands.trello.time,
            },
          });
        }, 300000);
      } else if (state === 1) {
        if (message.content !== 'none') {
          if (!lists[_.parseInt(message.content)]) {
            caller.utils.createMessage(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titles.error,
                description: lang.commands.trello.validList,
              },
            });
            return;
          }
          guild.trello.new = lists[_.parseInt(message.content)];
        } else guild.trello.new = null;
        let description = lang.commands.trello.pickApprove;
        lists.forEach((list) => {
          description += `${_.findIndex(lists, list)}. ${list.name}\n`;
        });
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            description,
            color: caller.color.blue,
            title: lang.commands.trello.pickApproveTitle,
          },
        });
        state = 2;
        clearTimeout(timer);
        timer = setTimeout(() => {
          caller.bot.off('messageCreate', handler);
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.commands.trello.time,
            },
          });
        }, 300000);
      } else if (state === 2) {
        if (message.content !== 'none') {
          if (!lists[_.parseInt(message.content)]) {
            caller.utils.createMessage(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titles.error,
                description: lang.commands.trello.validList,
              },
            });
            return;
          }
          guild.trello.approved = lists[_.parseInt(message.content)];
        } else guild.trello.approved = null;
        let description = lang.commands.trello.pickDenied;
        lists.forEach((list) => {
          description += `${_.findIndex(lists, list)}. ${list.name}\n`;
        });
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            description,
            color: caller.color.blue,
            title: lang.commands.trello.pickDeniedTitle,
          },
        });
        state = 3;
        clearTimeout(timer);
        timer = setTimeout(() => {
          caller.bot.off('messageCreate', handler);
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.commands.trello.time,
            },
          });
        }, 300000);
      } else if (state === 3) {
        if (message.content !== 'none') {
          if (!lists[_.parseInt(message.content)]) {
            caller.utils.createMessage(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titles.error,
                description: lang.commands.trello.validList,
              },
            });
            return;
          }
          guild.trello.denied = lists[_.parseInt(message.content)];
        } else guild.trello.denied = null;
        let description = lang.commands.trello.pickPotential;
        lists.forEach((list) => {
          description += `${_.findIndex(lists, list)}. ${list.name}\n`;
        });
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            description,
            color: caller.color.blue,
            title: lang.commands.trello.pickPotentialTitle,
          },
        });
        state = 4;
        clearTimeout(timer);
        timer = setTimeout(() => {
          caller.bot.off('messageCreate', handler);
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.commands.trello.time,
            },
          });
        }, 300000);
      } else if (state === 4) {
        if (message.content !== 'none') {
          if (!lists[_.parseInt(message.content)]) {
            caller.utils.createMessage(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titles.error,
                description: lang.commands.trello.validList,
              },
            });
            return;
          }
          guild.trello.potential = lists[_.parseInt(message.content)];
        } else guild.trello.potential = null;
        let description = lang.commands.trello.pickInvalid;
        lists.forEach((list) => {
          description += `${_.findIndex(lists, list)}. ${list.name}\n`;
        });
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            description,
            color: caller.color.blue,
            title: lang.commands.trello.pickInvalidTitle,
          },
        });
        state = 5;
        clearTimeout(timer);
        timer = setTimeout(() => {
          caller.bot.off('messageCreate', handler);
          caller.utils.createMessage(command.msg.channel.id, {
            embed: {
              color: caller.color.yellow,
              title: lang.titles.error,
              description: lang.commands.trello.time,
            },
          });
        }, 300000);
      } else if (state === 5) {
        if (message.content !== 'none') {
          if (!lists[_.parseInt(message.content)]) {
            caller.utils.createMessage(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titles.error,
                description: lang.commands.trello.validList,
              },
            });
            return;
          }
          guild.trello.invalid = lists[_.parseInt(message.content)];
        } else guild.trello.invalid = null;
        clearTimeout(timer);
        guild.trello.enabled = true;
        await caller.utils.updateGuild(guild);
        caller.utils.createMessage(command.msg.channel.id, {
          embed: {
            color: caller.color.green,
            title: lang.titles.complete,
            description: lang.commands.trello.set,
          },
        });
        caller.bot.off('messageCreate', handler);
      }
    }
  };
  caller.bot.on('messageCreate', handler);
  timer = setTimeout(() => {
    caller.bot.off('messageCreate', handler);
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.commands.trello.time,
      },
    });
  }, 300000);
};

exports.Settings = {
  category: 1,
  command: 'trello',
  show: true,
  permissions: ['manageGuild'],
  dm: false,
};
