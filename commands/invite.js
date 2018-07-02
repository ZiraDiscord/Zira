'use strict';

exports.Run = async function Run(caller, command) {
  caller.utils.message(command.msg.channel.id, '<https://zira.pw/invite>');
};

exports.Settings = function Settings() {
  return {
    show: true,
    category: 'misc',
  };
};
