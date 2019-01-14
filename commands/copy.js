'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  if (command.msg.author.id !== process.env.OWNER) return;
  if (!command.params[0] || !command.params[1] || !command.params[2]) return;
  for (let index = 0; index < guild.roles.length; index++) {
    try {
      await caller.bot.addMessageReaction(command.params[0], command.params[1], guild.roles[index].emoji.replace(/(<:)|(<)|(>)/g, ''));
    } catch (e) {
      console.error(e);
    }
    guild.roles[index].msg = command.params[2];
  }
  caller.utils.updateGuild(guild);
};

exports.Settings = {
  command: 'TEMPLATE',
  category: 0,
  show: false,
  permissions: ['manageMessages'],
  dm: false,
};
