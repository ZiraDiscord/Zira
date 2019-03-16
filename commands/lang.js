'use strict';

exports.Run = async function Run(caller, command, guild, lang) {
    if (caller.utils.lang[command.params[0]]) {
      guild.lang = command.params[0];
      lang = caller.utils.getLang(guild);
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          description: lang.commands.lang.update,
          color: caller.color.green,
        },
      });
      caller.utils.updateGuild(guild);
    } else {
      let description = '';
      Object.keys(caller.utils.lang).forEach((lang) => {
          description += `**${command.prefix}lang ${lang}** ~~-~~ ${caller.utils.lang[lang].language}\n\n`;
      });
      description += lang.commands.lang.translate;
      caller.utils.createMessage(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          description,
        },
      });
    }
};

exports.Settings = {
  command: 'lang',
  category: 3,
  show: true,
  permissions: ['manageGuild'],
  dm: false,
};
