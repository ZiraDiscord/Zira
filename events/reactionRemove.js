'use strict';

exports.Run = async function Run(caller, _message, _emoji, _user) {
  const guild = await caller.utils.getGuild(_message.channel.guild.id);
  if (guild.msgid.indexOf(_message.id) === -1) return;
  if (!guild) return; // no idea why this would be undefined or null but yea
  const [role] = guild.roles.filter(r => r.msg === _message.id && (r.emoji === _emoji.name || r.emoji.indexOf(_emoji.id) !== -1));
  const message = await caller.bot.getMessage(_message.channel.id, _message.id).catch(console.error);
  const me = _message.channel.guild.members.get(caller.bot.user.id);
  const user = message.channel.guild.members.get(_user);
  const lang = caller.utils.getLang(guild);
  if (role) {
    if (!me.permission.has('manageRoles')) return;
    const [claimedUser] = await caller.db.Find('once', {
      id: _user,
    });
    if (claimedUser) {
      if (claimedUser.claimed.indexOf(role.id) !== -1) return;
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
        await user.edit({
          roles: userRoles,
        }, 'Reaction Role');
      } catch (e) {
        console.error(e);
        return;
      }
      let roles = '';
      role.ids.forEach((id, index) => {
        roles += `<@&${id}>${(index === role.ids.length - 1) ? ' ' : ', '}`;
      });
      if (guild.log) {
        caller.utils.message(guild.log, {
          embed: {
            footer: {
              text: `${user.username}#${user.discriminator}`,
              icon_url: user.avatarURL,
            },
            color: 0xb31414,
            description: `<@${user.id}>${lang.log.remove[0]}${role.emoji}${lang.log.remove[1]}${roles}`,
            timestamp: new Date(),
          },
        }).catch((e) => {
          console.error(e);
          if (e.code === 50013 || e.code === 50001) {
            guild.log = '';
            caller.utils.updateGuild(guild);
          }
        });
      }
      return;
    }
    try {
      await message.channel.guild.removeMemberRole(_user, role.id, 'Reaction Role');
    } catch (e) {
      console.error(e);
      return;
    }
    if (guild.log) {
      caller.utils.message(guild.log, {
        embed: {
          footer: {
            text: `${user.username}#${user.discriminator}`,
            icon_url: user.avatarURL,
          },
          color: 0xb31414,
          description: `<@${user.id}>${lang.log.remove[0]}${role.emoji}${lang.log.remove[1]}<@&${role.id}>`,
          timestamp: new Date(),
        },
      }).catch((e) => {
        console.error(e);
        if (e.code === 50013 || e.code === 50001) {
          guild.log = '';
          caller.utils.updateGuild(guild);
        }
      });
    }
  }
};
