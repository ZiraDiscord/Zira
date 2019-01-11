'use strict';

const fs = require('fs');
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
    this.schema();
  }

  /**
   * Make sure all collections are in the database
   */
  async schema() {
    await this.db.create('reaction');
    await this.db.create('once');
    const changelog = await this.db.create('changelog');
    const log = await changelog.findOne({ id: 0 });
    if (!log) {
      await changelog.insert({ id: 0, version: '0.0.0', changes: false, changelog: '' });
    }
    const shards = await this.db.create('shards');
    const doc = await shards.findOne({ id: 0 });
    if (!doc) {
      await shards.insert({ id: 0, guilds_0: [] });
    }
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
      logger.warn(
        `[Message Error] ${channel} ${e.message.replace(/\n\s/g, '')}`,
      );
      if (e.code === 50013) {
        this.bot
          .createMessage(
            channel,
            "I'm unable to send the message as I'm missing the permission `Embed Links` in this channel.",
          )
          .catch((err) => {
            logger.warn(
              `[Message Error] ${channel} ${err.message.replace(/\n\s/g, '')}`,
            );
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

  /**
   * Get language file
   * @param {Object} guild - Guild object
   * @param {string} guild.lang - Language code
   */
  // eslint-disable-next-line consistent-return
  getLang(
    guild = {
      lang: 'en',
    },
  ) {
    let { lang } = guild;
    if (!guild.lang) lang = 'en';
    if (!fs.existsSync(`./lang/${lang}.json`)) lang = 'en';
    try {
      return require(`../lang/${lang}.json`); // eslint-disable-line
    } catch (e) {
      logger.error(
        `[Lang Error] Error when getting file: ${lang} :: ${JSON.stringify(e)}`,
      );
    } finally {
      delete require.cache[require.resolve(`../lang/${lang}.json`)];
    }
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
        roles: [],
        msgid: [],
        chan: '',
      };
      guilds.insert(guild);
    }
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

  mapObj(map) {
    const obj = {};
    map.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  postStats(caller) {
    process.send({
      name: 'stats',
      data: {
        messages: caller.handler.seen,
        commands: caller.handler.commands,
        users: caller.bot.users.filter((u) => !u.bot).length,
        bots: caller.bot.users.filter((u) => u.bot).length,
        guilds: caller.bot.guilds.map((g) => g.id),
        memory: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
        uptime: caller.utils.getTime(caller.bot.startTime),
        cluster: caller.id,
        shards: caller.bot.shards.size,
      },
    });
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
}

module.exports = Utils;
