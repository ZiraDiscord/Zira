'use strict';

const {
  EventEmitter,
} = require('events');

class CommandHandler extends EventEmitter {
  constructor(bot, DB) {
    super();
    if (!process.env.PREFIX) {
      throw new Error('Missing prefix in pm2.json');
    }
    this.seen = 0;
    this.commands = 0;
    this.prefix = process.env.PREFIX;
    this.bot = bot;
    this.db = DB;
    bot.on('messageCreate', (msg) => {
      this.seen++;
      this.parseMessage(msg);
    });
  }

  async GetGuildPrefix(msg) {
    if (!msg.channel.guild) {
      return this.prefix;
    }
    let guild = await this.db.Find('reaction', {
      id: msg.channel.guild.id,
    });
    [guild] = guild;
    if (guild) {
      if (guild.prefix) {
        return guild.prefix;
      }
    }
    return this.prefix;
  }

   GetParams(raw) {
    const parms = [];
    let lastSpace = -1;
    let end = false;
    while (!end) {
      let BeginSpace = raw.indexOf(' ', lastSpace);
      let EndSpace = -1;
      if (BeginSpace !== -1) {
        EndSpace = raw.indexOf(' ', BeginSpace + 1);
        if (EndSpace === -1) {
          EndSpace = raw.length;
          end = true;
        }
        let param = raw.substring(BeginSpace + 1, EndSpace);
        const containsQuoteIndex = param.indexOf('"');
        let BeginQuote = -1;
        let EndQuote = -1;
        if (containsQuoteIndex !== -1) {
          BeginQuote = raw.indexOf('"', BeginSpace);
          EndQuote = raw.indexOf('"', BeginQuote + 1);
          if (EndQuote !== -1) {
            BeginSpace = BeginQuote;
            EndSpace = EndQuote;
            param = raw.substring(BeginSpace + 1, EndSpace);
          }
        }
        lastSpace = EndSpace;
        if (param) {
          parms.push(param);
        }
      } else {
        end = true;
      }
    }
    return parms;
  }

   Sanitize(string) {
    let str = string;
    while (str.indexOf('../') !== -1) {
      str = str.replace('../', '');
    }
    while (str.indexOf('./') !== -1) {
      str = str.replace('./', '');
    }
    return str;
  }

  async parseMessage(msg) {
    if (msg.author.bot) return;
    const gpr = await this.GetGuildPrefix(msg, this);
    const guild = msg.content.slice(0, gpr.length);
    const testpref = msg.content.slice(0, this.prefix.length);
    const mention = msg.content.slice(0, `<@${this.bot.user.id}>`.length);
    const mentionNick = msg.content.slice(0, `<@!${this.bot.user.id}>`.length);
    if (testpref === this.prefix) {
      const params = this.GetParams(msg.content);
      let SpaceIndex = msg.content.length;
      if (msg.content.indexOf(' ') !== -1) {
        SpaceIndex = msg.content.indexOf(' ');
      }
      let firstWord = msg.content.substring(0, SpaceIndex);
      firstWord = this.Sanitize(firstWord);
      if (this.prefix.length === 1) {
        firstWord = firstWord.substr(1);
      } else {
        firstWord = firstWord.substr(this.prefix.length);
      }
      firstWord = firstWord.toLowerCase();
      if (!firstWord) return;
      const command = {
        msg,
        params,
        command: firstWord,
        prefix: testpref,
      };
      this.emit('command', command);
      this.commands++;
    } else if (guild === gpr) {
      const params = this.GetParams(msg.content);
      let SpaceIndex = msg.content.length;
      if (msg.content.indexOf(' ') !== -1) {
        SpaceIndex = msg.content.indexOf(' ');
      }
      let firstWord = msg.content.substring(0, SpaceIndex);
      firstWord = this.Sanitize(firstWord);
      if (guild.length === 1) {
        firstWord = firstWord.substr(1);
      } else {
        firstWord = firstWord.substr(guild.length);
      }
      firstWord = firstWord.toLowerCase();
      if (!firstWord) return;
      const command = {
        msg,
        params,
        command: firstWord,
        prefix: guild,
      };
      this.emit('command', command);
      this.commands++;
    } else if (mention === `<@${this.bot.user.id}>`) {
      const params = this.GetParams(msg.content);
      let SpaceIndex = msg.content.length;
      if (msg.content.indexOf(' ') !== -1) {
        SpaceIndex = msg.content.indexOf(' ');
      }
      let firstWord = msg.content.substring(0, SpaceIndex);
      firstWord = this.Sanitize(firstWord);
      if (`<@${this.bot.user.id}>`.length === 1) {
        firstWord = firstWord.substr(1);
      } else {
        firstWord = firstWord.substr(`<@${this.bot.user.id}>`.length);
      }
      if (!params[0]) return;
      firstWord = params[0].toLowerCase();
      params.shift();
      if (!firstWord) return;
      const command = {
        msg,
        params,
        command: firstWord,
        prefix: `<@${this.bot.user.id}> `,
      };
      this.emit('command', command);
      this.commands++;
    } else
    if (mentionNick === `<@!${this.bot.user.id}>`) {
      const params = this.GetParams(msg.content);

      let SpaceIndex = msg.content.length;
      if (msg.content.indexOf(' ') !== -1) {
        SpaceIndex = msg.content.indexOf(' ');
      }
      let firstWord = msg.content.substring(0, SpaceIndex);
      firstWord = this.Sanitize(firstWord);
      if (`<@!${this.bot.user.id}>`.length === 1) {
        firstWord = firstWord.substr(1);
      } else {
        firstWord = firstWord.substr(`<@!${this.bot.user.id}>`.length);
      }
      if (!params[0]) return;
      firstWord = params[0].toLowerCase();
      params.shift();
      if (!firstWord) return;
      const command = {
        msg,
        params,
        command: firstWord,
        prefix: `<@!${this.bot.user.id}> `,
      };
      this.emit('command', command);
      this.commands++;
    }
}
}
module.exports = CommandHandler;
