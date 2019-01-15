'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  caller.utils.createMessage(command.msg.channel.id, 'Test');
};

exports.Settings = {
  command: 'TEMPLATE',
  category: 0,
  show: false,
  permissions: ['manageMessages'],
  dm: false,
};
