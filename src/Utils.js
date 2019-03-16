'use strict';

const fs = require('fs');
const mime = require('mime');
const request = require('request');
const logger = require('./logger');
const DB = require('./DB');

/**
 * @typedef {Object} Permissions
 * @property {boolean} hasPermissions User has all permissions or not
 * @property {Array} missing Array of missing permissions
 */

class Utils {
  /**
   * @constructor
   * @param {Object} caller - this of Zira.js
   * @param {Object} caller.bot - Eris client
   */
  constructor(caller) {
    this.db = DB;
    this.bot = caller.bot;
    this.caller = caller;
    this.lang = {};
    this.schema();
    this.loadLanguages();
  }

  /**
   * Make sure all collections are in the database
   */
  async schema() {
    if (this.caller.id !== 0) return;
    await this.db.create('reaction');
    await this.db.create('users');
    await this.db.create('premium');
    if (process.env.API) {
      const statsCollection = await this.db.create('stats');
      const stats = await statsCollection.findOne({ id: 0 });
      if (!stats) {
        await statsCollection.insert({
          id: 0,
          clusters: {},
        });
      }
    }
    const changelog = await this.db.create('changelog');
    const log = await changelog.findOne({ id: 0 });
    if (!log) {
      await changelog.insert({
        id: 0,
        version: '0.0.0',
        changes: false,
        changelog: '',
      });
    }
    logger.info('[Utils] Schema');
  }

  /**
   * Send a message to a channel
   * @async
   * @param {snowflake} channel - Channel ID
   * @param {Object|string} content - Embed or String
   */
  async createMessage(channel, content) {
    try {
      await this.bot.createMessage(channel, content);
    } catch (e) {
      logger.warn(`[Message Error] ${channel} ${e.message.replace(/\n\s/g, '')}`);
      if (e.code === 50013) {
        this.bot.createMessage(channel, "I'm unable to send the message as I'm missing the permission `Embed Links` in this channel.").catch((err) => {
          logger.warn(`[Message Error] ${channel} ${err.message.replace(/\n\s/g, '')}`);
        });
      }
    }
  }

  /**
   * Get the date from a snowflake
   * @param {snowflake} resourceID - User/Guild/Channel/Message ID
   * @returns {Date} Date of snowflakes creation
   */
  snowflakeDate(resourceID) {
    return new Date(parseInt(resourceID) / 4194304 + 1420070400000); // eslint-disable-line
  }

  /**
   * Returns random number
   * @param {number} min - Minimum number
   * @param {number} max - Maximum number
   * @returns {number} Random number between min and max
   */
  randomNumber(min, max) {
    const first = Math.ceil(min);
    const second = Math.floor(max);
    return Math.floor(Math.random() * (second - first + 1)) + first;
  }

  getRandomElement(array) {
    return array[this.randomNumber(0, array.length - 1)];
  }

  parseID(input) {
    return input.replace(/\D+/g, '');
  }

  /**
   * Get time between now and a date
   * @param {Date} time - Date
   * @returns {string} Formatted date
   */
  getTime(time) {
    const currentTime = new Date();
    const elapsed = currentTime - time;
    let weeks = 0;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = parseInt(elapsed / 1000, 10);
    while (seconds >= 60) {
      minutes++;
      seconds -= 60;
      if (minutes === 60) {
        hours++;
        minutes = 0;
      }
      if (hours === 24) {
        days++;
        hours = 0;
      }
      if (days >= 7) {
        weeks++;
        days = 0;
      }
    }
    let message = '';
    if (weeks > 0) {
      if (weeks === 1) {
        message += '1 week';
      } else {
        message += `${weeks} weeks`;
      }
    }
    if (days > 0) {
      if (weeks > 0) message += ', ';
      if (days === 1) {
        message += '1 day';
      } else {
        message += `${days} days`;
      }
    }
    if (hours > 0) {
      if (days > 0 || weeks > 0) message += ', ';
      if (hours === 1) {
        message += '1 hour';
      } else {
        message += `${hours} hours`;
      }
    }
    if (minutes > 0) {
      if (hours > 0 || days > 0 || weeks > 0) message += ', ';
      if (minutes === 1) {
        message += '1 minute';
      } else {
        message += `${minutes} minutes`;
      }
    }
    if (seconds > 0) {
      if (minutes > 0 || hours > 0 || days > 0 || weeks > 0) message += ', ';
      if (seconds === 1) {
        message += '1 second';
      } else {
        message += `${seconds} seconds`;
      }
    }
    if (!message) message = '1 second';
    return message;
  }

  ordinalSuffix(i) {
    if (i % 10 === 1 && i % 100 !== 11) {
      return `${i}st`;
    }
    if (i % 10 === 2 && i % 100 !== 12) {
      return `${i}nd`;
    }
    if (i % 10 === 3 && i % 100 !== 13) {
      return `${i}rd`;
    }
    return `${i}th`;
  }

  getLang(
    guild = {
      lang: 'en',
    },
  ) {
    let { lang } = guild;
    if (!guild.lang) lang = 'en';
    if (this.lang[lang]) {
      return this.lang[lang];
    }
    return this.lang.en;
  }

  combine(First, Second) {
    const res = [];
    const arr = First.concat(Second);
    let I = arr.length;
    const Obj = {};
    while (I--) {
      const item = arr[I];
      if (!Obj[item]) {
        res.unshift(item);
        Obj[item] = true;
      }
    }
    return res;
  }

  parseParams(Params) {
    const params = [];
    let string = '';
    if (typeof Params === 'object') string = Params.join(' ');
    if (typeof Params === 'string') string = Params;
    string.split(', ').forEach((str) => {
      const emoji = str.split(' ', 1)[0];
      let role = str.replace(`${emoji} `, '');
      if (role.indexOf('<@&') !== -1) role = role.replace(/\D+/g, '');
      params.push([emoji, role]);
    });
    return params;
  }

  /**
   * Get guild from Mongo
   * @async
   * @param {snowflake} id - Guild ID
   * @returns {Object} Guild object
   */
  async getGuild(id) {
    const guilds = await this.db.get('reaction');
    let guild = await guilds.findOne({ id });
    if (!guild) {
      guild = {
        id,
        name: null,
        icon: null,
        roles: [],
        messages: [],
        currentChannel: null,
        currentMessage: null,
        log: null,
        joinChannel: null,
        joinMessage: [],
        leaveChannel: null,
        leaveMessage: [],
        bot: [],
        user: [],
        premium: false,
        premiumExpires: null,
        premiumUsers: {},
        suggestions: [],
        suggestion: {
          submit: null,
          dm: false,
          role: null,
          new: null,
          approved: null,
          denied: null,
          invalid: null,
          potential: null,
          reaction: false,
          emojis: ['👍', '👎'],
        },
        prefix: null,
        lang: 'en',
        commandRole: null,
        privateChannel: null,
        trello: {
          enabled: false,
          board: null,
          new: null,
          approved: null,
          denied: null,
          potential: null,
          invalid: null,
        },
      };
      await guilds.insert(guild);
    }
    guild = await this.configCheck(guild); // Doing this for when rewrite is live as the databse will have the old configs
    return guild;
  }

  /**
   * Update guild object
   * @async
   * @param {Object} guild - Guild object
   */
  async updateGuild(guild) {
    const guilds = await this.db.get('reaction');
    await guilds.findOneAndUpdate({ id: guild.id }, guild);
  }

  async getChangelog() {
    const changelog = await this.db.get('changelog');
    const res = await changelog.findOne({ id: 0 });
    return res;
  }

  mapToArray(map) {
    const array = [];
    map.forEach((value) => {
      array.push(value);
    });
    return array;
  }

  async postStats(caller) {
    process.send({
      name: 'stats',
      data: {
        messages: caller.handler.seen,
        commands: caller.handler.commands,
        users: caller.bot.users.filter((u) => !u.bot).length,
        bots: caller.bot.users.filter((u) => u.bot).length,
        guilds: caller.bot.guilds.map((g) => g.id),
        memory: parseFloat((process.memoryUsage().rss / 1024 / 1024).toFixed(2), 10),
        uptime: caller.utils.getTime(caller.bot.startTime),
        cluster: caller.id,
        shards: caller.bot.shards.size,
        latency: caller.bot.shards.map((shard) => shard.latency),
        status: caller.bot.shards.map((shard) => ({ id: shard.id, status: shard.status })),
      },
    });
    if (!process.env.API) return;
    const statsCollection = await caller.db.get('stats');
    const ipc = await caller.ipc.getStats(new Date().getTime());
    await statsCollection.findOneAndUpdate({ id: 0 }, { id: 0, clusters: ipc.data });
  }

  /**
   * Checks user permissions
   * @param {Object} userPermissions - Object of user permissions
   * @param {Array} permissionsToCheck - Array of permissions to check
   * @returns {Permissions}
   */
  checkPermissions(userPermissions, permissionsToCheck) {
    let hasPermission = true;
    const missing = [];
    permissionsToCheck.forEach((permission) => {
      if (!userPermissions[permission]) {
        hasPermission = false;
        missing.push(permission);
      }
    });
    return { hasPermission, missing };
  }

  async pagination(pages, channel, user, page = 0) {
    let currentPage = 0;
    let message;
    try {
      message = await this.bot.createMessage(channel.id, pages[page]);
    } catch (e) {
      logger.warn(`[Message Error] ${channel.id} ${e.message.replace(/\n\s/g, '')}`);
      if (e.code === 50013) {
        this.bot.createMessage(channel.id, "I'm unable to send the message as I'm missing the permission `Embed Links` in this channel.id.").catch((err) => {
          logger.warn(`[Message Error] ${channel.id} ${err.message.replace(/\n\s/g, '')}`);
        });
      }
    }
    if (pages.length === 1) return;
    await this.bot.addMessageReaction(channel.id, message.id, '⬅').catch(console.error);
    await this.bot.addMessageReaction(channel.id, message.id, '◀').catch(console.error);
    await this.bot.addMessageReaction(channel.id, message.id, '🇽').catch(console.error);
    await this.bot.addMessageReaction(channel.id, message.id, '▶').catch(console.error);
    await this.bot.addMessageReaction(channel.id, message.id, '➡').catch(console.error);
    const handler = (msg, emoji, usr) => {
      if (msg.id === message.id) {
        if (usr === user || JSON.parse(process.env.ADMINS).indexOf(usr) !== -1) {
          switch (emoji.name) {
            case '⬅':
              currentPage = 0;
              this.bot.editMessage(channel.id, message.id, pages[0]).catch(console.error);
              if (channel.type === 0) {
                this.bot.removeMessageReaction(channel.id, message.id, '⬅', user).catch(console.error);
              }
              break;
            case '◀':
              currentPage -= 1;
              if (currentPage < 0) currentPage = 0;
              this.bot.editMessage(channel.id, message.id, pages[currentPage]).catch(console.error);
              if (channel.type === 0) {
                this.bot.removeMessageReaction(channel.id, message.id, '◀', user).catch(console.error);
              }
              break;
            case '🇽':
              message.delete().catch(console.error);
              break;
            case '▶':
              currentPage += 1;
              if (currentPage > pages.length - 1) {
                currentPage = pages.length - 1;
              }
              this.bot.editMessage(channel.id, message.id, pages[currentPage]).catch(console.error);
              if (channel.type === 0) {
                this.bot.removeMessageReaction(channel.id, message.id, '▶', user).catch(console.error);
              }
              break;
            case '➡':
              currentPage = pages.length - 1;
              this.bot.editMessage(channel.id, message.id, pages[pages.length - 1]).catch(console.error);
              if (channel.type === 0) {
                this.bot.removeMessageReaction(channel.id, message.id, '➡', user).catch(console.error);
              }
              break;
            default:
          }
        }
      }
    };
    const { bot } = this;
    this.bot.on('messageReactionAdd', handler);
    setTimeout(() => bot.off('messageReactionAdd', handler), 300000);
  }

  async configCheck(config) {
    const premiumCollection = await this.db.get('premium');
    let premium = await premiumCollection.findOne({ id: config.id });
    if (!premium) {
      premium = { premium: false, premiumExpires: null, premiumUsers: {} };
    }
    const roles = [];
    config.roles.forEach((role) => {
      if (role.msg) {
        role.message = role.msg;
        delete role.msg;
      }
      roles.push(role);
    });
    let { joinMessage } = config;
    if (typeof joinMessage === 'string') joinMessage = [joinMessage];
    if (joinMessage === null) joinMessage = [];
    let { leaveMessage } = config;
    if (typeof leaveMessage === 'string') leaveMessage = [leaveMessage];
    if (leaveMessage === null) leaveMessage = [];
    if (!config.suggestion) {
      config.suggestion = {
        submit: null,
        dm: false,
        role: null,
        new: null,
        approved: null,
        denied: null,
        invalid: null,
        potential: null,
        reaction: false,
        emojis: ['👍', '👎'],
      };
    }
    return {
      id: config.id,
      name: config.name,
      icon: config.icon,
      roles,
      messages: config.msgid ? config.msgid : config.messages,
      currentChannel: config.chan ? config.chan : config.currentChannel,
      currentMessage: config.emoji ? config.emoji : config.currentMessage,
      log: config.log ? config.log : null,
      joinChannel: config.joinChannel ? config.joinChannel : null,
      joinMessage,
      leaveChannel: config.leaveChannel ? config.leaveChannel : null,
      leaveMessage,
      bot: config.bot ? config.bot : [],
      user: config.user ? config.user : [],
      premium: premium.premium,
      premiumExpires: premium.premiumExpires,
      premiumUsers: premium.premiumUsers,
      suggestions: config.suggestions ? config.suggestions : [],
      suggestion: {
        submit: config.submitChannel ? config.submitChannel : config.suggestion.submit,
        dm: config.suggestionDM ? config.suggestionDM : config.suggestion.dm,
        role: config.suggestionRole ? config.suggestionRole : config.suggestion.role,
        new: typeof config.suggestion === 'string' ? config.suggestion : config.suggestion.new,
        approved: config.suggestion.approved ? config.suggestion.approved : null,
        denied: config.suggestion.denied ? config.suggestion.denied : null,
        invalid: config.suggestion.invalid ? config.suggestion.invalid : null,
        potential: config.suggestion.potential ? config.suggestion.potential : null,
        reaction: config.suggestion.reaction ? config.suggestion.reaction : false,
        emojis: config.suggestion.emojis ? config.suggestion.emojis : ['👍', '👎'],
      },
      prefix: config.prefix ? config.prefix : null,
      lang: config.lang ? config.lang : 'en',
      commandRole: config.commandRole ? config.commandRole : null,
      privateChannel: config.privateChannel ? config.privateChannel : null,
      trello: config.trello
        ? {
            enabled: config.trello.enabled,
            board: config.trello.board ? config.trello.board : null,
            new: config.trello.list ? config.trello.list : config.trello.new,
            approved: config.trello.approved ? config.trello.approved : null,
            denied: config.trello.denied ? config.trello.denied : null,
            potential: config.trello.potential ? config.trello.potential : null,
            invalid: config.trello.invalid ? config.trello.invalid : null,
          }
        : {
            enabled: false,
            board: null,
            new: null,
            approved: null,
            denied: null,
            potential: null,
            invalid: null,
          },
    };
  }

  arraysEqual(array1, array2) {
    if (array1.length !== array2.length) return false;
    for (let i = array1.length; i--; ) {
      if (array1[i] !== array2[i]) return false;
    }
    return true;
  }

  getImageBuffer(attachments) {
    return new Promise((resolve, reject) => {
      if (!attachments.length || mime.getType(attachments[0].url).indexOf('image/') === -1) {
        resolve(null);
        return;
      }
      request.defaults({ encoding: null })(attachments[0].url, (err, res, body) => {
        if (err) {
          reject(err);
        } else resolve(body);
      });
    });
  }

  async loadLanguages() {
    for (const language of JSON.parse(process.env.LANGUAGES)) {
      try {
        const res = await this.loadLanguage(language);
        this.lang[language] = JSON.parse(res);
      } catch (e) {
        console.error('Error while loading', language, e);
      }
    }
    logger.info(`Loaded translations for ${Object.keys(this.lang).join(', ')}`);
  }

  loadLanguage(language) {
    return new Promise((resolve, reject) => {
      request(`https://raw.githubusercontent.com/ZiraDiscord/Translations/bot/${language}.json`, (err, res, body) => {
        if (err) {
          reject(err);
        } else if (body === '404: Not Found\n') {
          reject(new Error('404 Not Found'));
        } else resolve(body);
      });
    });
  }
}

module.exports = Utils;
