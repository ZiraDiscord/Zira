'use strict';

exports.Run = async function Run(caller, command, GUILD) {
  if (!command.msg.channel.guild) {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        description: ':warning: This command can\'t be used in DM',
        color: caller.color.yellow,
      },
    }).catch(console.error);
    return;
  }
  let guild = GUILD;
  const lang = caller.utils.getLang(guild);
  if (command.msg.author.id === process.env.OWNER || command.msg.author.id === command.msg.channel.guild.ownerID) {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        color: caller.color.yellow,
        title: lang.reset.title,
        description: lang.reset.question,
      },
    });
    let timer;
    const handler = async (message) => {
      if (message.author.id !== command.msg.author.id && message.channel.id !== command.msg.id) return;
      console.log(message.content);
      if (message.content === 'yes') {
        guild = {
          id: guild.id,
          roles: [],
          msgid: [],
          chan: '',
          emoji: '',
          user: [],
          bot: [],
          log: '',
          joinChannel: '',
          joinMessage: '',
          leaveChannel: '',
          leaveMessage: '',
          suggestionRole: '',
          suggestionDM: false,
          approveChannel: '',
          lang: guild.lang,
        };
        if (GUILD.premium) {
          guild.premium = GUILD.premium;
          guild.premiumExpires = GUILD.premiumExpires;
          guild.premiumUsers = GUILD.premiumUsers;
        }
        caller.utils.message(command.msg.channel.id, {
          embed: {
            color: caller.color.green,
            description: lang.reset.yes,
          },
        });
        caller.utils.updateGuild(guild);
        caller.bot.off('messageCreate', handler);
        clearTimeout(timer);
      } else if (message.content === 'no') {
        caller.utils.message(command.msg.channel.id, {
          embed: {
            color: caller.color.blue,
            description: lang.reset.no,
          },
        });
        caller.bot.off('messageCreate', handler);
        clearTimeout(timer);
      }
    };
    caller.bot.on('messageCreate', handler);
    timer = setTimeout(() => {
      caller.bot.off('messageCreate', handler);
    }, 120000);
  } else {
    caller.utils.sendMessage(command, {
      embed: {
        title: lang.titleError,
        description: lang.reset.perm,
        color: caller.color.yellow,
      },
    });
  }
};

exports.Settings = function Settings() {
  return {
    show: true,
    category: 'misc',
  };
};
