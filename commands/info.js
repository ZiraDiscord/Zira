'use strict';

// eslint-disable-next-line no-unused-vars
exports.Run = async function Run(caller, command, GUILD, lang) {
  const changelog = await caller.utils.getChangelog();
  caller.utils.createMessage(command.msg.channel.id, {
    embed: {
      color: caller.color.blue,
      fields: [
        {
          name: lang.commands.info.fields[0],
          value: changelog.version,
        },
        {
          name: lang.commands.info.fields[1],
          value: '[Eris](https://abal.moe/Eris/)',
        },
        {
          name: lang.commands.info.fields[2],
          value: '[ZiraDiscord/Zira](https://github.com/ZiraDiscord/Zira)',
        },
        {
          name: lang.commands.info.fields[3],
          value: 'Developer - Hazed SPaCEx#2574\nDeveloper - JakeyPrime#0001',
        },
      ],
    },
  });
};

exports.Settings = {
  command: 'info',
  show: true,
  permissions: [],
  dm: true,
};
