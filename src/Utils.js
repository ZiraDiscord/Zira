'use strict';

const Logger = require('disnode-logger');
const fs = require('fs');

class Utils {
  constructor(caller) {
    this.db = caller.db;
    this.bot = caller.bot;
    this.caller = caller;
  }

  async message(channel, content) {
    try {
      await this.bot.createMessage(channel, content);
    } catch (e) {
      this.caller.Logger.Warning('Message', ` ${channel} `, e.message.replace(/\n\s/g, ''));
      if (e.code === 50013) {
        this.bot.createMessage(channel, 'I\'m unable to send the message as I\'m missing the permission `Embed Links` in this channel.').catch(err => this.caller.Logger.Warning('Error Message', ` ${channel} `, err.message.replace(/\n\s/g, '')));
      }
    }
  }

  snowflakeDate(resourceID) {
    return new Date(parseInt(resourceID) / 4194304 + 1420070400000); // eslint-disable-line
  }

  randomNumber(min, max) {
    const first = Math.ceil(min);
    const second = Math.floor(max);
    return Math.floor(Math.random() * ((second - first) + 1)) + first;
  }

  getTime(time) {
    const currentTime = new Date();
    const elapsed = currentTime - time;
    let weeks = 0;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = parseInt(elapsed / 1000); // eslint-disable-line
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
    if ((i % 10) === 1 && (i % 100) !== 11) {
      return `${i}st`;
    }
    if ((i % 10) === 2 && (i % 100) !== 12) {
      return `${i}nd`;
    }
    if ((i % 10) === 3 && (i % 100) !== 13) {
      return `${i}rd`;
    }
    return `${i}th`;
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

  getLang(guild = { // eslint-disable-line
    lang: 'en',
  }) {
    let {
      lang,
    } = guild;
    if (!guild.lang) lang = 'en';
    if (!fs.existsSync(`./lang/${lang}.json`)) lang = 'en';
    try {
      return require(`../lang/${lang}.json`); // eslint-disable-line
    } catch (e) {
      Logger.Error('Utils', 'getLang', `Error when getting file: ${lang} :: ${e}`);
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

  async getGuild(id) {
    const self = this;
    let guild = await self.db.Find('reaction', {
      id,
    });
    [guild] = guild;
    if (!guild) {
      guild = {
        id,
        roles: [],
        msgid: [],
        chan: '',
      };
      self.db.Insert('reaction', guild);
    }
    return guild;
  }

  async updateGuild(guild) {
    const self = this;
    const {
      id,
    } = guild;
    await self.db.Update('reaction', {
      id,
    }, guild);
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
        users: caller.bot.users.filter(u => !u.bot).length,
        bots: caller.bot.users.filter(u => u.bot).length,
        guilds: caller.bot.guilds.map(g => g.id),
        memory: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
        uptime: caller.utils.getTime(caller.bot.startTime),
        cluster: caller.id,
        shards: caller.bot.shards.size,
      },
    });
  }
}

module.exports = Utils;
