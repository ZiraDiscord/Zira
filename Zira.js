'use strict';

const Eris = require('eris');
const fs = require('fs');
const Trello = require('trello');
const logger = require('./src/logger');
const CommandHandler = require('./src/CommandHandler.js');
const DB = require('./src/DB.js');
const Utils = require('./src/Utils.js');
const IPC = require('./src/IPC.js');

class Zira {
  constructor({ firstShardID, lastShardID, maxShards, cluster }) {
    this.bot = new Eris(process.env.TOKEN, {
      disableEvents: {
        TYPING_START: true,
        PRESENCE_UPDATE: true,
      },
      maxShards,
      firstShardID,
      lastShardID,
      defaultImageFormat: 'png',
      compress: true,
      messageLimit: 0,
    });

    this.id = cluster;
    this.ipc = new IPC();
    this.color = {
      blue: 3447003,
      green: 1433628,
      yellow: 16772880,
      red: 16729871,
    };
    this.db = DB;
    this.handler = new CommandHandler(this.bot, DB);
    this.utils = new Utils(this);
    this.userRateLimits = {};
    if (process.env.TRELLO_KEY && process.env.TRELLO_TOKEN && process.env.TRELLO_ID) {
      this.trello = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);
    }
    this.logger = logger;
    this.bot.on('ready', () => {
      this.logger.info(`[Cluster] ${this.id} ready!`);
      this.bot.editStatus({
        name: `${process.env.PREFIX}help | docs.zira.ovh`,
        type: 0,
      });
      setInterval(this.utils.postStats, 5000, this);
      this.utils.postStats(this);
      if (process.env.STATUS_ID && process.env.STATUS_TOKEN) {
        this.bot.executeWebhook(process.env.STATUS_ID, process.env.STATUS_TOKEN, {
          embeds: [
            {
              color: 7271027,
              title: `Cluster ${this.id} Ready`,
              description: `**Shards:** ${firstShardID} / ${lastShardID}\n**Total Shards:** ${maxShards}\n**Guilds:** ${this.bot.guilds.size}\n**Languages Loaded:** ${Object.keys(this.utils.lang).join(', ')}`,
              footer: {
                text: this.bot.user.username,
                icon_url: this.bot.user.avatarURL,
              },
              timestamp: new Date(),
            },
          ],
        });
      }
    });

    this.bot.on('shardReady', (shard) => {
      this.logger.info(`[Shard] Cluster: ${this.id} ID: ${shard} ready!`);
      if (process.env.STATUS_ID && process.env.STATUS_TOKEN) {
        this.bot.executeWebhook(process.env.STATUS_ID, process.env.STATUS_TOKEN, {
          embeds: [
            {
              color: 7271027,
              title: `Shard ${shard} Ready`,
              description: `**Cluster:** ${this.id}`,
              footer: {
                text: this.bot.user.username,
                icon_url: this.bot.user.avatarURL,
              },
              timestamp: new Date(),
            },
          ],
        });
      }
    });

    this.handler.on('command', async (command) => {
      const channel = command.msg.channel.type === 0 ? `#${command.msg.channel.name} ${command.msg.channel.id}` : 'DM';
      if (fs.existsSync(`./commands/${command.command}.js`)) {
        try {
          let guild = null;
          if (command.guild) {
            guild = await this.utils.getGuild(command.guild.id);
            guild.name = command.guild.name;
            guild.icon = command.guild.iconURL ? command.guild.iconURL.replace('.jpg', '.png') : '';
          }

          const lang = this.utils.getLang(guild !== null ? guild : { lang: 'en' });

          this.logger.info(`${channel} ${command.msg.author.username} (${command.msg.author.id}): ${command.command} ${command.params.join(' ')}`);

          const Command = require(`./commands/${command.command}.js`); // eslint-disable-line

          if (command.msg.channel.type === 1 && !Command.Settings.dm) {
            this.utils.createMessage(command.msg.channel.id, {
              embed: {
                description: ":warning: This command can't be used in DM",
                color: this.color.yellow,
              },
            });
            return;
          }
          const permissions =
            JSON.parse(process.env.ADMINS).indexOf(command.msg.author.id) === -1 ? this.utils.checkPermissions(command.msg.member ? command.msg.member.permission.json : {}, Command.Settings.permissions) : { hasPermission: true, missing: [] };
          if (['approve', 'deny', 'invalid', 'maybe'].indexOf(command.command) !== -1 && command.msg.member.roles.indexOf(guild.suggestion.role) !== -1) {
            permissions.hasPermission = true;
          }
          if (permissions.hasPermission === false && command.msg.member.roles.indexOf(guild.commandRole) === -1) {
            this.logger.warn(`${command.msg.author.username} is missing ${permissions.missing.join(', ')} to use ${command.command}`);
            this.utils.createMessage(command.msg.channel.id, {
              embed: {
                color: this.color.yellow,
                title: lang.titleError,
                description: `${lang.userPermissions} **${permissions.missing.join(', ')}**`,
              },
            });
            return;
          }

          Command.Run(this, command, guild, lang);
        } catch (err) {
          console.error(err);
        } finally {
          delete require.cache[require.resolve(`./commands/${command.command}.js`)];
        }
      } else {
        this.logger.info(`${channel} ${command.msg.author.username} (${command.msg.author.id}): Unknown command ${command.command}`);
      }
    });

    this.bot.on('disconnect', () => {
      this.logger.warn(`[Cluster] ${this.id} disconnected`);
      if (process.env.STATUS_ID && process.env.STATUS_TOKEN) {
        this.bot.executeWebhook(process.env.STATUS_ID, process.env.STATUS_TOKEN, {
          embeds: [
            {
              color: 16737075,
              title: `Cluster ${this.id} Disconnected`,
              description: `**Shards:** ${firstShardID} / ${lastShardID}\n**Total Shards:** ${maxShards}`,
              footer: {
                text: this.bot.user.username,
                icon_url: this.bot.user.avatarURL,
              },
              timestamp: new Date(),
            },
          ],
        });
      }
    });

    this.bot.on('shardDisconnect', (message, shard) => {
      this.logger.warn(`[Shard] ${shard} disconnected ${message}`);
      if (process.env.STATUS_ID && process.env.STATUS_TOKEN) {
        this.bot.executeWebhook(process.env.STATUS_ID, process.env.STATUS_TOKEN, {
          embeds: [
            {
              color: 16737075,
              title: `Shard ${shard} Disconnected`,
              description: `**Cluster:** ${this.id}`,
              footer: {
                text: this.bot.user.username,
                icon_url: this.bot.user.avatarURL,
              },
              timestamp: new Date(),
            },
          ],
        });
      }
    });

    this.bot.on('shardResume', (shard) => {
      this.logger.warn(`[Shard] ${shard} resumed`);
      if (process.env.STATUS_ID && process.env.STATUS_TOKEN) {
        this.bot.executeWebhook(process.env.STATUS_ID, process.env.STATUS_TOKEN, {
          embeds: [
            {
              color: 16775040,
              title: `Shard ${shard} Resumed`,
              description: `**Cluster:** ${this.id}`,
              footer: {
                text: this.bot.user.username,
                icon_url: this.bot.user.avatarURL,
              },
              timestamp: new Date(),
            },
          ],
        });
      }
    });

    this.bot.on('messageReactionAdd', async (message, emoji, user) => {
      if (!message.channel.guild || user === this.bot.user.id) return;
      try {
        const Handler = require('./events/reactionAdd.js'); // eslint-disable-line
        Handler.Run(this, message, emoji, user);
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/reactionAdd.js')];
      }
    });

    this.bot.on('messageReactionRemove', async (message, emoji, user) => {
      if (!message.channel.guild) return;
      if (user === this.bot.user.id) return;
      try {
        const Handler = require('./events/reactionRemove.js'); // eslint-disable-line
        Handler.Run(this, message, emoji, user);
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/reactionRemove.js')];
      }
    });

    this.bot.on('guildCreate', async (guild) => {
      try {
        const Handler = require('./events/guildCreate.js'); // eslint-disable-line
        Handler.Run(this, guild);
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/guildCreate.js')];
      }
    });

    this.bot.on('guildDelete', async (guild) => {
      try {
        const Handler = require('./events/guildDelete.js'); // eslint-disable-line
        Handler.Run(this, guild);
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/guildDelete.js')];
      }
    });

    this.bot.on('guildMemberAdd', async (guild, member) => {
      try {
        const Handler = require('./events/guildMemberAdd.js'); // eslint-disable-line
        Handler.Run(this, guild, member, await this.utils.getGuild(guild.id));
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/guildMemberAdd.js')];
      }
    });

    this.bot.on('guildMemberRemove', async (guild, member) => {
      try {
        const Handler = require('./events/guildMemberRemove.js'); // eslint-disable-line
        Handler.Run(this, guild, member, await this.utils.getGuild(guild.id));
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/guildMemberRemove.js')];
      }
    });

    this.bot.on('guildMemberUpdate', async (guild, member, old) => {
      try {
        const Handler = require('./events/guildMemberUpdate.js'); // eslint-disable-line
        Handler.Run(this, guild, member, old);
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/guildMemberUpdate.js')];
      }
    });

    this.bot.on('voiceChannelJoin', async (member, newChannel) => {
      try {
        const Handler = require('./events/voiceChannelJoin.js'); // eslint-disable-line
        Handler.Run(this, member, newChannel, await this.utils.getGuild(member.guild.id));
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/voiceChannelJoin.js')];
      }
    });

    this.bot.on('voiceChannelLeave', async (member, oldChannel) => {
      try {
        const Handler = require('./events/voiceChannelLeave.js'); // eslint-disable-line
        Handler.Run(this, member, oldChannel, await this.utils.getGuild(member.guild.id));
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/voiceChannelLeave.js')];
      }
    });

    this.bot.on('voiceChannelSwitch', async (member, newChannel, oldChannel) => {
      try {
        const Handler = require('./events/voiceChannelSwitch.js'); // eslint-disable-line
        Handler.Run(this, member, newChannel, oldChannel, await this.utils.getGuild(member.guild.id));
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/voiceChannelSwitch.js')];
      }
    });

    this.bot.on('rawWS', async (packet) => {
      if (packet.t !== 'MESSAGE_DELETE' && packet.t !== 'MESSAGE_DELETE_BULK') {
        return;
      }
      try {
        const Handler = require('./events/messageDelete.js'); // eslint-disable-line
        Handler.Run(this, packet.d);
      } catch (e) {
        console.error(e);
      } finally {
        delete require.cache[require.resolve('./events/messageDelete.js')];
      }
    });

    process.on('message', (data) => {
      switch (data.name) {
        case 'guild': {
          const guild = this.bot.guilds.get(data.value);
          if (!guild) return;
          const guildObj = guild;
          guildObj.channels = this.utils.mapToArray(guild.channels);
          guildObj.roles = this.utils.mapToArray(guild.roles);
          guildObj.members = this.utils.mapToArray(guild.members);
          guildObj.icon = guild.iconURL;
          guildObj.created = guild.createdAt;
          process.send({
            name: 'return',
            id: guild.id,
            data: guild,
            cluster: this.id,
          });
          break;
        }
        case 'user': {
          const user = this.bot.users.get(data.value);
          if (!user) {
            process.send({
              name: 'return',
              id: data.value,
              data: false,
              cluster: this.id,
            });
            return;
          }
          user.guilds = this.bot.guilds.filter((guild) => guild.members.get(data.value)).map((guild) => ({ id: guild.id, name: guild.name }));
          process.send({
            name: 'return',
            id: user.id,
            data: {
              id: user.id,
              username: user.username,
              discriminator: user.discriminator,
              avatar: user.avatarURL,
              bot: user.bot,
              guilds: this.bot.guilds.filter((guild) => guild.members.get(data.value)).map((guild) => ({ id: guild.id, name: guild.name })),
              createdAt: user.createdAt,
            },
            cluster: this.id,
          });
          break;
        }
        default:
      }
    });

    this.bot.connect();
  }
}

module.exports = Zira;
