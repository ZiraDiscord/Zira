'use strict';

const numeral = require('numeral');

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
    switch (command.params[0]) {
      case 'channel':
        {
          if (!command.params[1]) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.blue,
                title: lang.title,
                description: `**${command.prefix}${lang.suggestion.channel.help[0]}${command.prefix}${lang.suggestion.channel.help[1]}`,
              },
            }).catch(console.error);
            return;
          }
          const channel = command.msg.channel.guild.channels.get(command.params[1].replace(/\D/g, ''));
          if (command.params[1] === 'disable') {
            guild.suggestion = '';
            caller.utils.message(command.msg.channel.id, {
              embed: {
                title: lang.titleComp,
                description: lang.suggestion.stop,
                color: caller.color.green,
              },
            }).catch(console.error);
            caller.utils.updateGuild(guild);
            return;
          }
          if (!channel) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                title: lang.titleError,
                description: lang.unknownChannel,
                color: caller.color.yellow,
              },
            }).catch(console.error);
            return;
          }
          guild.suggestion = channel.id;
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              description: lang.suggestion.channel.set[0] + guild.suggestion + lang.suggestion.channel.set[1],
              color: caller.color.green,
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
          break;
        }
      case 'submit':
        {
          if (!guild.premium && process.env.PREMIUM) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titleError,
                description: lang.premium,
              },
            }).catch(console.error);
            return;
          }
          if (!command.params[1]) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.blue,
                title: lang.title,
                description: `**${command.prefix}${lang.suggestion.submit.help[0]}${command.prefix}${lang.suggestion.submit.help[1]}`,
              },
            }).catch(console.error);
            return;
          }
          const channel = command.msg.channel.guild.channels.get(command.params[1].replace(/\D/g, ''));
          if (command.params[1] === 'disable') {
            guild.submitChannel = '';
            caller.utils.message(command.msg.channel.id, {
              embed: {
                title: lang.titleComp,
                description: lang.suggestion.submit.disable,
                color: caller.color.green,
              },
            }).catch(console.error);
            caller.utils.updateGuild(guild);
            return;
          }
          if (!channel) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                title: lang.titleError,
                description: lang.unknownChannel,
                color: caller.color.yellow,
              },
            }).catch(console.error);
            return;
          }
          guild.submitChannel = channel.id;
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              description: `${lang.suggestion.submit.set}${guild.submitChannel}>`,
              color: caller.color.green,
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
          break;
        }
      case 'approve':
        {
          if (!guild.premium && process.env.PREMIUM) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titleError,
                description: lang.premium,
              },
            }).catch(console.error);
            return;
          }
          if (!command.params[1]) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.blue,
                title: lang.title,
                description: `**${command.prefix}${lang.suggestion.approve.help[0]}${command.prefix}${lang.suggestion.approve.help[1]}`,
              },
            }).catch(console.error);
            return;
          }
          const channel = command.msg.channel.guild.channels.get(command.params[1].replace(/\D/g, ''));
          if (command.params[1] === 'disable') {
            guild.approveChannel = '';
            caller.utils.message(command.msg.channel.id, {
              embed: {
                title: lang.titleComp,
                description: lang.suggestion.stop,
                color: caller.color.green,
              },
            }).catch(console.error);
            caller.utils.updateGuild(guild);
            return;
          }
          if (!channel) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                title: lang.titleError,
                description: lang.unknownChannel,
                color: caller.color.yellow,
              },
            }).catch(console.error);
            return;
          }
          guild.approveChannel = channel.id;
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              description: `${lang.suggestion.approve.set}${guild.approveChannel}>`,
              color: caller.color.green,
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
          break;
        }
      case 'dm':
        {
          if (!guild.premium && process.env.PREMIUM) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titleError,
                description: lang.premium,
              },
            }).catch(console.error);
            return;
          }
          guild.suggestionDM = guild.suggestionDM !== true;
          caller.utils.message(command.msg.channel.id, {
            embed: {
              color: caller.color.green,
              title: lang.titleComp,
              description: (guild.suggestionDM) ? lang.suggestion.dm.set : lang.suggestion.dm.disable,
            },
          });
          caller.utils.updateGuild(guild);
          break;
        }
      case 'role':
        {
          if (!command.params[1]) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.blue,
                title: lang.title,
                description: `**${command.prefix}${lang.suggestion.role.help[0]}${command.prefix}${lang.suggestion.role.help[1]}\n\n${lang.example}${command.prefix}suggestion role Moderator`,
              },
            }).catch(console.error);
            return;
          }
          if (command.params[1] === 'revoke') {
            if (guild.suggestionRole) {
              caller.utils.message(command.msg.channel.id, {
                embed: {
                  title: lang.titleComp,
                  description: lang.suggestion.role.revoke[0] + guild.suggestionRole + lang.suggestion.role.revoke[1],
                  color: caller.color.green,
                },
              }).catch(console.error);
              guild.suggestionRole = '';
              caller.utils.updateGuild(guild);
            } else {
              caller.utils.message(command.msg.channel.id, {
                embed: {
                  title: lang.titleError,
                  description: lang.suggestion.role.noset,
                  color: caller.color.yellow,
                },
              }).catch(console.error);
            }
          } else {
            let role;
            if (command.params[1].indexOf('<@&') !== -1) {
              role = command.msg.channel.guild.roles.get(command.params[1].replace(/\D/g, ''));
            } else {
              const name = command.params.splice(1).join(' ').toLowerCase();
              [role] = command.msg.channel.guild.roles.filter(r => r.name.toLowerCase().indexOf(name) !== -1);
            }
            if (!role) {
              caller.utils.message(command.msg.channel.id, {
                embed: {
                  title: lang.titleError,
                  description: lang.unknownRole,
                  color: caller.color.yellow,
                },
              }).catch(console.error);
              return;
            }
            guild.suggestionRole = role.id;
            caller.utils.message(command.msg.channel.id, {
              embed: {
                title: lang.titleComp,
                description: `${lang.suggestion.role.set}${guild.suggestionRole}>`,
                color: caller.color.green,
              },
            }).catch(console.error);
            caller.utils.updateGuild(guild);
          }
          break;
        }
      case 'trello':
        {
          if (!guild.premium && process.env.PREMIUM) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titleError,
                description: lang.premium,
              },
            }).catch(console.error);
            return;
          }
          if (!command.params[1]) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.blue,
                title: lang.title,
                description: `**${command.prefix}${lang.suggestion.trello.help[0]}${command.prefix}${lang.suggestion.trello.help[1]}`,
              },
            }).catch(console.error);
            return;
          }
          if (command.params[1] === 'disable') {
            if (guild.trello) {
              guild.trello.enabled = false;
              caller.utils.message(command.msg.channel.id, {
                embed: {
                  color: caller.color.green,
                  title: lang.titleComp,
                  description: lang.suggestion.trello.disable,
                },
              }).catch(console.error);
              caller.utils.updateGuild(guild);
            } else {
              caller.utils.message(command.msg.channel.id, {
                embed: {
                  color: caller.color.yellow,
                  title: lang.titleError,
                  description: lang.suggestion.trello.noset,
                },
              }).catch(console.error);
            }
            return;
          }
          const Boards = await caller.trello.getBoards(process.env.TRELLO_ID);
          if (Boards.map(b => b.shortLink).indexOf(command.params[1]) === -1) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titleError,
                description: lang.suggestion.trello.unknown,
              },
            }).catch(console.error);
            return;
          }
          const Lists = await caller.trello.getListsOnBoard(command.params[1]);
          if (!Lists.length) {
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titleError,
                description: lang.suggestion.trello.noLists,
              },
            }).catch(console.error);
            return;
          }
          const authID = Math.random().toString(36).substr(2, 5);
          const DM = await caller.bot.users.get(command.msg.author.id).getDMChannel();
          caller.utils.message(DM.id, authID).catch(console.error);
          caller.utils.message(command.msg.channel.id, {
            embed: {
              color: caller.color.blue,
              title: lang.suggestion.trello.title,
              description: lang.suggestion.trello.verify,
            },
          }).catch(console.error);
          let verified = false;
          const lists = await caller.trello.getListsOnBoard(command.params[1]);
          let timer;
          const handler = async (message) => {
            if (message.author.id !== command.msg.author.id && message.channel.id !== command.msg.id) return;
            console.log(message.content);
            if (message.content === 'done' && !verified) {
              const cards = await caller.trello.getCardsOnBoard(command.params[1]);
              const [card] = cards.filter(c => c.name === authID);
              if (!card) {
                caller.utils.message(command.msg.channel.id, {
                  embed: {
                    color: caller.color.yellow,
                    title: lang.titleError,
                    description: lang.suggestion.trello.noCard.replace('$title', authID),
                  },
                }).catch(console.error);
                caller.bot.off('messageCreate', handler);
                clearTimeout(timer);
                return;
              }
              let description = lang.suggestion.trello.list[0];
              lists.forEach((list, index) => {
                description += `**${index}** ~~-~~ ${list.name}\n`;
              });
              description += lang.suggestion.trello.list[1];
              caller.utils.message(command.msg.channel.id, {
                embed: {
                  color: caller.color.blue,
                  description,
                },
              }).catch(console.error);
              verified = true;
              clearTimeout(timer);
              timer = setTimeout(() => {
                caller.bot.off('messageCreate', handler);
                caller.utils.message(command.msg.channel.id, {
                  embed: {
                    color: caller.color.yellow,
                    title: lang.titleError,
                    description: lang.suggestion.trello.timeout,
                  },
                }).catch(console.error);
              }, 120000);
            } else if (lists[numeral(message.content).value()]) {
              const list = lists[numeral(message.content).value()];
              guild.trello = {
                board: command.params[1],
                list: list.id,
                name: list.name,
                enabled: true,
              };
              caller.utils.updateGuild(guild);
              caller.utils.message(command.msg.channel.id, {
                embed: {
                  color: caller.color.green,
                  title: lang.titleComp,
                  description: lang.suggestion.trello.set,
                },
              }).catch(console.error);
              caller.bot.off('messageCreate', handler);
              clearTimeout(timer);
            }
          };
          caller.bot.on('messageCreate', handler);
          timer = setTimeout(() => {
            caller.bot.off('messageCreate', handler);
            caller.utils.message(command.msg.channel.id, {
              embed: {
                color: caller.color.yellow,
                title: lang.titleError,
                description: lang.suggestion.trello.timeout,
              },
            }).catch(console.error);
          }, 120000);
          break;
        }
      default:
        caller.utils.message(command.msg.channel.id, {
          embed: {
            color: caller.color.blue,
            title: lang.title,
            description: `**${command.prefix}${lang.suggestion.help[0]}${command.prefix}${lang.suggestion.help[1]}${command.prefix}${lang.suggestion.help[2]}${command.prefix}${lang.suggestion.help[3]}${command.prefix}${lang.suggestion.help[4]}${command.prefix}${lang.suggestion.help[5]}`,
          },
        }).catch(console.error);
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
