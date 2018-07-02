'use strict';

exports.Run = async function Run(caller, command, guild) { // eslint-disable-line no-unused-vars
  if (command.msg.author.id !== process.env.OWNER) return;
  const code = command.params.join(' ');
  try {
    let evaled = eval(code); // eslint-disable-line
    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled); // eslint-disable-line
    if (evaled.length > 1960) {
      caller.utils.message(command.msg.channel.id, '```Result longer then 2000 characters so it was logged to console.```');
      console.log(evaled);
    } else if (evaled === undefined) {
      caller.utils.message(command.msg.channel.id, `\`\`\`json\n${evaled}\n\`\`\``);
    } else {
      caller.utils.message(command.msg.channel.id, `\`\`\`json\n${evaled}\n\`\`\``);
    }
  } catch (e) {
    caller.utils.message(command.msg.channel.id, `\`\`\`json\n${e}\n\`\`\``);
  }
};

exports.Settings = function Settings() {
  return {
    show: false,
  };
};
