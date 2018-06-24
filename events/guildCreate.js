'use strict';

exports.Run = async function Run(caller, guild) {
  if (!process.env.WEBHOOK_ID || !process.env.WEBHOOK_TOKEN) return;
  const owner = caller.bot.users.get(guild.ownerID);
  caller.Logger.Info('Guild Join', guild.id, `${guild.name} ${guild.memberCount}  |  ${owner.username}#${owner.discriminator} (${guild.ownerID})`);
  const bots = guild.members.filter(m => m.user.bot).length;
  caller.bot.executeWebhook(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN, {
    embeds: [{
      color: 0x00d62e,
      title: 'Joined Server',
      description: `**Name:** ${guild.name}\n**ID:** ${guild.id}\n**Owner:** ${owner.username}#${owner.discriminator} (${guild.ownerID})\n**Count:** ${guild.memberCount}\n**Users:** ${(guild.memberCount - bots)}\n**Bots:** ${bots}\n**Percent:** ${((bots / (guild.memberCount)) * 100).toFixed(2)} %\n**Created:** ${caller.utils.snowflakeDate(guild.id)}`,
      thumbnail: {
        url: guild.iconURL,
      },
      timestamp: new Date(),
    }],
  }).catch(console.error);
};
