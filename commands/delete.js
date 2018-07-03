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
          description: `**${command.prefix}${lang.delete.help[0]}${command.prefix}${lang.delete.help[1]}${command.prefix}${lang.delete.help[2]}\n\n${lang.example}${command.prefix}delete ${command.msg.id} Updates\n${command.prefix}delete ${command.msg.id} <@&${ROLES[caller.utils.randomNumber(0, ROLES.length - 1)].id}>\n[${lang.guide}](https://zira.pw/guide/remove)`,
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
    if (command.params[1] === 'check') {
      if (!guild.roles.filter(r => r.msg === command.params[0]).length) {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.delete.noRoles,
            color: caller.color.yellow,
          },
        }).catch(console.error);
        return;
      }
      let Removed = 0;
      await guild.roles.forEach(async (role, index) => {
        if (role.msg === command.params[0]) {
          if (!command.msg.channel.guild.roles.get(role.id)) {
            Removed++;
            guild.roles.splice(index, 1);
            try {
              await caller.bot.removeMessageReaction((role.channel) ? role.channel : guild.chan, role.msg, role.emoji.replace(/(<:)|(<)|(>)/g, ''));
            } catch (e) {
              caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
            }
          }
        }
      });
      if (Removed) {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleComp,
            description: lang.delete.checkRemove[0] + Removed + lang.delete.checkRemove[1],
            color: caller.color.green,
          },
        }).catch(console.error);
        caller.utils.updateGuild(guild);
      } else {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleComp,
            description: lang.delete.checkGood,
            color: caller.color.green,
          },
        }).catch(console.error);
      }
    } else {
      let role;
      if (command.params[1].indexOf('<@&') !== -1 || isNaN(command.params[1]) === false) { // eslint-disable-line
        role = command.msg.channel.guild.roles.get(command.params[1].replace(/\D/g, ''));
      } else {
        const name = command.params.splice(1).join(' ').toLowerCase();
        [role] = command.msg.channel.guild.roles.filter(r => r.name.toLowerCase() === name);
      }
      if (role) {
        let pos = 0;
        let old;
        let found = false;
        guild.roles.forEach(async (item, index) => {
          if (!found) {
            if (item.id === role.id && item.msg === command.params[0]) {
              pos = index;
              old = item;
              found = true;
            } else if (item.ids.indexOf(role.id) !== -1 && item.msg === command.params[0]) {
              pos = index;
              old = item;
              found = true;
            }
          }
        });
        if (found) {
          guild.roles.splice(pos, 1);
          if (old.ids) {
            [old.id] = old.ids;
          }
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleComp,
              description: lang.delete.removed[0] + old.id + lang.delete.removed[1] + old.emoji,
              color: caller.color.green,
            },
          }).catch(console.error);
          caller.utils.updateGuild(guild);
          try {
            await caller.bot.removeMessageReaction((old.channel) ? old.channel : guild.chan, old.msg, old.emoji.replace(/(<:)|(<)|(>)/g, ''));
          } catch (e) {
            caller.Logger.Warning(command.msg.author.username, ` ${command.msg.author.id} ${command.msg.channel.id} `, e.message.replace(/\n\s/g, ''));
          }
        } else {
          caller.utils.message(command.msg.channel.id, {
            embed: {
              title: lang.titleError,
              description: lang.delete.setup,
              color: caller.color.yellow,
            },
          }).catch(console.error);
        }
      } else {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            title: lang.titleError,
            description: lang.delete.unknown,
            color: caller.color.yellow,
          },
        }).catch(console.error);
      }
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
