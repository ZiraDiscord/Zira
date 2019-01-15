'use strict';

exports.Run = async function Run(caller, guild) {
  if (!process.env.WEBHOOK_ID || !process.env.WEBHOOK_TOKEN) return;
  caller.logger.info(`[guildDelete] ${guild.id} ${guild.name} ${guild.memberCount}`);
  caller.bot.executeWebhook(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN, {
    embeds: [{
      color: 0xb31414,
      title: 'Left Server',
      description: `**Name:** ${guild.name}\n**ID:** ${guild.id}`,
      thumbnail: {
        url: guild.iconURL,
      },
      timestamp: new Date(),
    }],
  }).catch(console.error);
};
