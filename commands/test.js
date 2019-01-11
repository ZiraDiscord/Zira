'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, GUILD, lang) {
  caller.utils.createMessage(command.msg.channel.id, 'Test');
};

exports.Settings = {
  command: 'test',
  show: false,
  permissions: ['manageMessages'],
  dm: false,
};
