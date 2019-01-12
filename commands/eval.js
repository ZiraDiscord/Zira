'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, guild, lang) {
  if (JSON.parse(process.env.ADMINS).indexOf(command.msg.author.id) === -1) {
    return;
  }
  // eslint-disable-next-line no-unused-vars
  const ipc = await caller.ipc.getStats(command.msg.id);
  const code = command.params.join(' ');
  try {
    let evaled = eval(code); // eslint-disable-line
    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled); // eslint-disable-line
    if (evaled.length > 1960) {
      caller.utils.createMessage(
        command.msg.channel.id,
        '```Result longer then 2000 characters so it was logged to console.```',
      );
      console.log(evaled);
    } else if (evaled === undefined) {
      caller.utils.createMessage(
        command.msg.channel.id,
        `\`\`\`json\n${evaled}\n\`\`\``,
      );
    } else {
      caller.utils.createMessage(
        command.msg.channel.id,
        `\`\`\`json\n${evaled}\n\`\`\``,
      );
    }
  } catch (e) {
    caller.utils.createMessage(
      command.msg.channel.id,
      `\`\`\`json\n${e}\n\`\`\``,
    );
  }
};

exports.Settings = {
  command: 'eval',
  show: false,
  permissions: [],
  dm: true,
};
