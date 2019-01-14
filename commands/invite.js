'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  caller.utils.createMessage(command.msg.channel.id, 'https://zira.pw/invite');
};

exports.Settings = {
  command: 'invite',
  category: 3,
  show: true,
  permissions: [],
  dm: true,
};
