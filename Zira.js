'use strict';

const Eris = require('eris');
const fs = require('fs');
const Logger = require('disnode-logger');
const Trello = require('trello');
const CommandHandler = require('./src/CommandHandler.js');
const DB = require('./src/DB.js');
const Utils = require('./src/Utils.js');
const IPC = require('./src/IPC.js');

class Zira {
  constructor({
    firstShardID,
    lastShardID,
    maxShards,
    cluster,
  }) {
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
      messageLimit: 1,
    });
    DB.Connect();
    this.handler = new CommandHandler(this.bot, DB);
    this.id = cluster;
    this.db = DB;
    this.ipc = new IPC();
    this.Logger = Logger;
    this.color = {
      blue: 3447003,
      green: 1433628,
      yellow: 16772880,
      red: 16729871,
    };
    this.utils = new Utils(this);
    this.userRateLimits = {};
    if (process.env.TRELLO_KEY && process.env.TRELLO_TOKEN && process.env.TRELLO_ID) this.trello = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);

    this.bot.on('ready', () => {
      this.Logger.Success(this.bot.user.username, 'Cluster Ready', `Cluster ${this.id}`);
      this.bot.editStatus({
        name: `${process.env.PREFIX}help | zira.pw`,
        type: 0,
      });
      setInterval(this.utils.postStats, 5000, this);
      this.utils.postStats(this);
    });

    this.bot.on('shardReady', (shard) => {
      this.Logger.Success(this.bot.user.username, 'Shard Ready', `Cluster ${this.id} Shard ${shard}`);
    });

    this.handler.on('command', async (command) => {
      if (fs.existsSync(`./commands/${command.command}.js`)) {
        try {
          let guild;
          if (command.msg.channel.guild) {
            guild = await this.utils.getGuild(command.msg.channel.guild.id);
            guild.name = command.msg.channel.guild.name;
            guild.icon = (command.msg.channel.guild.iconURL) ? command.msg.channel.guild.iconURL.replace('.jpg', '.png') : '';
          }
          this.Logger.Info(command.msg.author.username, (command.msg.channel.guild) ? ` ${command.msg.author.id} ${command.msg.channel.id} ${command.msg.channel.guild.id} ` : ` ${command.msg.author.id} ${command.msg.channel.id} DM`, `Comamnd: ${command.command} ${command.params.join(' ')}`);
          const Command = require(`./commands/${command.command}.js`); // eslint-disable-line
          Command.Run(this, command, guild);
        } catch (err) {
          console.error(err);
        } finally {
          delete require.cache[require.resolve(`./commands/${command.command}.js`)];
        }
      } else this.Logger.Info(command.msg.author.username, (command.msg.channel.guild) ? ` ${command.msg.author.id} ${command.msg.channel.id} ${command.msg.channel.guild.id} ` : ` ${command.msg.author.id} ${command.msg.channel.id} DM`, `Unknown Comamnd: ${command.command}`);
    });

    this.bot.on('shardDisconnect', (message, shard) => {
      this.Logger.Warning('Disconnect', `Shard ${shard}`, `${message}`);
    });

    this.bot.on('messageReactionAdd', async (message, emoji, user) => {
      if (!message.channel.guild) return;
      if (user === this.bot.user.id) return;
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

    this.bot.on('rawWS', async (packet) => {
      if (packet.t !== 'MESSAGE_DELETE' && packet.t !== 'MESSAGE_DELETE_BULK') return;
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
        case 'return':
          this.ipc.emit(data.id, {
            cluster: data.cluster,
            data: data.data,
          });
          break;
        case 'guild':
          {
            const guild = this.bot.guilds.get(data.value);
            if (!guild) return;
            const guildObj = guild;
            guildObj.channels = this.utils.mapObj(guild.channels);
            guildObj.roles = this.utils.mapObj(guild.roles);
            guildObj.members = this.utils.mapObj(guild.members);
            process.send({
              name: 'return',
              id: guildObj.id,
              data: guildObj,
              cluster: this.id,
            });
            break;
          }
        case 'user':
          {
            const user = this.bot.users.get(data.value);
            if (!user) return;
            process.send({
              name: 'return',
              id: user.id,
              data: user,
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
