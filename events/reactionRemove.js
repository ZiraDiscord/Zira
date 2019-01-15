'use strict';

exports.Run = async function Run(caller, _message, _emoji, _user) {
  const guild = await caller.utils.getGuild(_message.channel.guild.id);
  if (guild.messages.indexOf(_message.id) === -1) return;
  if (!guild) return; // no idea why this would be undefined or null but yea
  const [role] = guild.roles.filter(
    (r) => r.message === _message.id &&
      (r.emoji === _emoji.name || r.emoji.indexOf(_emoji.id) !== -1),
  );
  const message = await caller.bot
    .getMessage(_message.channel.id, _message.id)
    .catch(e => caller.logger.warn(
      `[reactionRemove] ${e.code} ${e.message.replace(
        /\n\s/g,
        '',
      )}`,
    ));
  const me = _message.channel.guild.members.get(caller.bot.user.id);
  const user = message.channel.guild.members.get(_user);
  const lang = caller.utils.getLang(guild);
  if (role) {
    if (role.remove) return;
    if (!me.permission.has('manageRoles')) return;
    const once = await caller.db.get('once');
    const claimedUser = await once.findOne({ id: _user });
    if (claimedUser) {
      if (claimedUser.claimed.indexOf(role.id) !== -1) return;
    }
    let highestRole = 0;
    me.roles.forEach((id) => {
      const { position } = message.channel.guild.roles.get(id);
      if (position > highestRole) highestRole = position;
    });
    if (role.id) {
      const ROLECHECK = message.channel.guild.roles.get(role.id);
      if (!ROLECHECK || ROLECHECK.position >= highestRole) return;
    } else if (role.ids) {
      let higher = false;
      role.ids.forEach((id) => {
        const ROLECHECK = message.channel.guild.roles.get(id);
        if (!ROLECHECK || ROLECHECK.position >= highestRole) higher = true;
      });
      if (higher) return;
    }
    if (role.multi) {
      let userRoles = [];
      await user.roles.forEach((id, index) => {
        if (role.ids.indexOf(id) !== -1) {
          userRoles.push(index);
        }
      });
      if (userRoles.length) {
        userRoles = userRoles.reverse();
        userRoles.forEach((i) => {
          user.roles.splice(i, 1);
        });
      }
      try {
        await user.edit(
          {
            roles: user.roles,
          },
          'Reaction Role',
        );
      } catch (e) {
        caller.logger.warn(
          `[reactionRemove] ${e.code} ${e.message.replace(
            /\n\s/g,
            '',
          )}`,
        );
        return;
      }
      let roles = '';
      role.ids.forEach((id, index) => {
        roles += `<@&${id}>${index === role.ids.length - 1 ? ' ' : ', '}`;
      });
      if (guild.log) {
        caller.bot
          .createMessage(guild.log, {
            embed: {
              footer: {
                text: `${user.username}#${user.discriminator}`,
                icon_url: user.avatarURL,
              },
              color: 0xb31414,
              description: `<@${user.id}>${lang.log.remove[0]}${role.emoji}${
                lang.log.remove[1]
              }${roles}`,
              timestamp: new Date(),
            },
          })
          .catch((e) => {
            caller.logger.warn(
              `[reactionRemove] ${e.code} ${e.message.replace(
                /\n\s/g,
                '',
              )}`,
            );
            if (e.code === 50013 || e.code === 50001) {
              guild.log = '';
              caller.utils.updateGuild(guild);
            }
          });
      }
      return;
    }
    try {
      await message.channel.guild.removeMemberRole(
        _user,
        role.id,
        'Reaction Role',
      );
    } catch (e) {
      caller.logger.warn(
        `[reactionRemove] ${e.code} ${e.message.replace(
          /\n\s/g,
          '',
        )}`,
      );
      return;
    }
    if (guild.log) {
      caller.bot
        .createMessage(guild.log, {
          embed: {
            footer: {
              text: `${user.username}#${user.discriminator}`,
              icon_url: user.avatarURL,
            },
            color: 0xb31414,
            description: `<@${user.id}>${lang.log.remove[0]}${role.emoji}${
              lang.log.remove[1]
            }<@&${role.id}>`,
            timestamp: new Date(),
          },
        })
        .catch((e) => {
          caller.logger.warn(
            `[reactionRemove] ${e.code} ${e.message.replace(
              /\n\s/g,
              '',
            )}`,
          );
          if (e.code === 50013 || e.code === 50001) {
            guild.log = '';
            caller.utils.updateGuild(guild);
          }
        });
    }
  }
};
