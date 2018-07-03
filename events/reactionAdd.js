'use strict';

exports.Run = async function Run(caller, _message, _emoji, _user) {
  const self = caller;
  const guild = await self.utils.getGuild(_message.channel.guild.id);
  const [role] = guild.roles.filter(r => r.msg === _message.id && (r.emoji === _emoji.name || r.emoji.indexOf(_emoji.id) !== -1));
  const emoji = (_emoji.id === null) ? _emoji.name : `${(_emoji.animated) ? '<a:' : '<:'}${_emoji.name}:${_emoji.id}>`;
  const message = await self.bot.getMessage(_message.channel.id, _message.id).catch(console.error);
  const me = message.channel.guild.members.get(self.bot.user.id);
  const user = message.channel.guild.members.get(_user);
  const lang = self.utils.getLang(guild.lang);
  let claimed = false;
  if (guild.msgid.indexOf(_message.id) === -1) return;
  if (role) {
    if (!me.permission.has('manageRoles')) return;
    if (role.toggle) {
      const toggleEmojis = guild.roles.filter(r => r.msg === _message.id && r.toggle === true && r.id !== role.id).map(r => r.emoji);
      if (self.userRateLimits[_user] !== undefined) {
        const ms = new Date().getTime() - self.userRateLimits[_user];
        if (ms < (500 * toggleEmojis.length)) return;
      }
      self.userRateLimits[_user] = new Date().getTime();
      if (me.permission.has('manageMessages')) {
        const ReactionKeys = Object.keys(message.reactions);
        ReactionKeys.forEach((i, index) => {
          if (toggleEmojis.indexOf(i) !== -1) {
            setTimeout(() => {
              message.removeReaction(i, _user).catch(console.error);
            }, 100 * index);
          }
        });
      }
    }
    if (role.once) {
      const [claimedUser] = await self.db.Find('once', {
        id: _user,
      });
      if (claimedUser) {
        if (claimedUser.claimed.indexOf(role.id) !== -1) {
          claimed = true;
        } else {
          claimedUser.claimed.push(role.id);
          await self.db.Update('once', {
            id: _user,
          }, claimedUser);
        }
      } else {
        await self.db.Insert('once', {
          id: _user,
          claimed: [role.id],
        });
      }
      if (me.permission.has('manageMessages')) await message.removeReaction(emoji.replace(/(<:)|(<)|(>)/g, ''), _user).catch(console.error);
    }
    if (role.remove) {
      if (user.roles.indexOf(role.id) !== -1) user.roles.splice(user.roles.indexOf(role.id), 1);
      if (user.roles.indexOf(role.add) === -1 && role.add) user.roles.push(role.add);
      try {
        await user.edit({
          roles: self.utils.combine(user.roles, role.ids),
        }, 'Reaction Role');
      } catch (e) {
        console.error(e);
        return;
      }
      self.bot.createMessage(guild.log, {
        embed: {
          footer: {
            text: `${user.username}#${user.discriminator}`,
            icon_url: user.avatarURL,
          },
          color: 0x00d62e,
          description: `<@${user.id}>${lang.log.give[0]}${role.emoji}${lang.log.remove[1]}<@&${role.id}>${lang.log.give[2]}<@&${role.add}>`,
          timestamp: new Date(),
        },
      }).catch((e) => {
        console.error(e);
        if (e.code === 50013 || e.code === 50001) {
          guild.log = '';
          self.utils.updateGuild(guild);
        }
      });
      if (me.permission.has('manageMessages')) await message.removeReaction(emoji.replace(/(<:)|(<)|(>)/g, ''), _user).catch(console.error);
      return; // eslint-disable-line
    }
    if (role.multi) {
      try {
        await user.edit({
          roles: self.utils.combine(user.roles, role.ids),
        }, 'Reaction Role');
      } catch (e) {
        console.error(e);
        return;
      }
      let roles = '';
      role.ids.forEach((id, index) => {
        roles += `<@&${id}>${(index === role.ids.length - 1) ? ' ' : ', '}`;
      });
      self.bot.createMessage(guild.log, {
        embed: {
          footer: {
            text: `${user.username}#${user.discriminator}`,
            icon_url: user.avatarURL,
          },
          color: 0x00d62e,
          description: `<@${user.id}>${lang.log.give[0]}${role.emoji}${lang.log.give[1]}${roles}`,
          timestamp: new Date(),
        },
      }).catch((e) => {
        console.error(e);
        if (e.code === 50013 || e.code === 50001) {
          guild.log = '';
          self.utils.updateGuild(guild);
        }
      });
      return; // eslint-disable-line
    }
    if (!claimed) {
      try {
        await message.channel.guild.addMemberRole(_user, role.id, 'Reaction Role');
      } catch (e) {
        console.error(e);
        return;
      }
      if (guild.log) {
        self.bot.createMessage(guild.log, {
          embed: {
            footer: {
              text: `${user.username}#${user.discriminator}`,
              icon_url: user.avatarURL,
            },
            color: 0x00d62e,
            description: `<@${user.id}>${lang.log.give[0]}${role.emoji}${lang.log.give[1]}<@&${role.id}>`,
            timestamp: new Date(),
          },
        }).catch((e) => {
          console.error(e);
          if (e.code === 50013 || e.code === 50001) {
            guild.log = '';
            self.utils.updateGuild(guild);
          }
        });
      }
      return; // eslint-disable-line
    }
  }
  if (me.permission.has('manageMessages')) await message.removeReaction(emoji.replace(/(<:)|(<)|(>)/g, ''), _user).catch(console.error);
};
