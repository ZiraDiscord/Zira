'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  if (!command.params.length) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.blue,
        title: lang.titles.use,
        fields: [
          {
            name:
              command.prefix + command.command + lang.commands.delete.params,
            value: lang.commands.delete.help,
          },
          {
            name: lang.example,
            value: `${command.prefix + command.command} ${
              command.msg.id
            } Updates\n\n[${
              lang.guidePage
            }](https://zira.pw/guide/${command.command})`,
          },
        ],
      },
    });
    return;
  }
  if (!guild.currentChannel) {
    caller.utils.createMessage(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.titles.error,
        description: lang.errors.setChannel,
      },
    });
    return;
  }
  if (command.params[1] === 'check') {
    if (!guild.roles.filter((r) => r.msg === command.params[0]).length) {
      caller.utils
        .createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            description: lang.commands.delete.noRoles,
            color: caller.color.yellow,
          },
        });
      return;
    }
    let Removed = 0;
    await guild.roles.forEach(async (role, index) => {
      if (role.message === command.params[0]) {
        if (!command.guild.roles.get(role.id)) {
          Removed++;
          guild.roles.splice(index, 1);
          try {
            await caller.bot.removeMessageReaction(
              role.channel ? role.channel : guild.chan,
              role.message,
              role.emoji.replace(/(<:)|(<)|(>)/g, ''),
            );
          } catch (e) {
            caller.logger.warn(`[Delete Check] ${e.code} ${e.message.replace(
              /\n\s/g,
              '',
            )}`);
          }
        }
      }
    });
    if (Removed) {
      caller.utils
        .createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.complete,
            description: lang.commands.delete.removedChecl.replace('$num', Removed),
            color: caller.color.green,
          },
        });
      caller.utils.updateGuild(guild);
    } else {
      caller.utils
        .createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.complete,
            description: lang.commands.delete.Good,
            color: caller.color.green,
          },
        });
    }
  } else {
    let role;
    if (
      command.params[1].indexOf('<@&') !== -1 ||
      isNaN(command.params[1]) === false
    ) {
      // eslint-disable-line
      role = command.guild.roles.get(
        command.params[1].replace(/\D/g, ''),
      );
    } else {
      const name = command.params
        .splice(1)
        .join(' ')
        .toLowerCase();
      [role] = command.guild.roles.filter(
        (r) => r.name.toLowerCase() === name,
      );
    }
    if (role) {
      let pos = 0;
      let old;
      let found = false;
      guild.roles.forEach(async (item, index) => {
        if (!found) {
          if (item.id === role.id && item.message === command.params[0]) {
            pos = index;
            old = item;
            found = true;
          } else if (
            item.ids &&
            item.ids.indexOf(role.id) !== -1 &&
            item.message === command.params[0]
          ) {
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
        caller.utils
          .createMessage(command.msg.channel.id, {
            embed: {
              title: lang.titles.complete,
              description: lang.commands.delete.removed.replace('$id', old.id).replace('$emoji', old.emoji),
              color: caller.color.green,
            },
          });
        caller.utils.updateGuild(guild);
        try {
          await caller.bot.removeMessageReaction(
            old.channel ? old.channel : guild.chan,
            old.message,
            old.emoji.replace(/(<:)|(<)|(>)/g, ''),
          );
        } catch (e) {
          caller.logger.warn(`[Delete] ${e.code} ${e.message.replace(
            /\n\s/g,
            '',
          )}`);
        }
      } else {
        caller.utils
          .createMessage(command.msg.channel.id, {
            embed: {
              title: lang.titles.error,
              description: lang.commands.delete.message,
              color: caller.color.yellow,
            },
          });
      }
    } else {
      caller.utils
        .createMessage(command.msg.channel.id, {
          embed: {
            title: lang.titles.error,
            description: lang.errors.unknownRole,
            color: caller.color.yellow,
          },
        });
    }
  }
};

exports.Settings = {
  category: 0,
  command: 'delete',
  show: true,
  permissions: ['manageRoles'],
  dm: false,
};
