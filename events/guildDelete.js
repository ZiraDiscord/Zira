'use strict';

const snekfetch = require('snekfetch');

exports.Run = async function Run(caller, guild) {
  if (!process.env.WEBHOOK_ID || !process.env.WEBHOOK_TOKEN) return;
  const res = await snekfetch.get(`https://api.zira.pw/guild/${guild.id}`);
  caller.Logger.Info('Guild Leave', guild.id, `${guild.name} ${guild.memberCount}`);
  if (res.body.found) {
    caller.bot.executeWebhook(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN, {
      embeds: [{
        color: 0xb31414,
        title: 'Left Blacklisted Server',
        description: `**Name:** ${guild.name}\n**ID:** ${guild.id}`,
        thumbnail: {
          url: guild.iconURL,
        },
        timestamp: new Date(),
      }],
    }).catch(console.error);
  } else {
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
  }
};
