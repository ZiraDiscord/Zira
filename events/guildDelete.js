'use strict';

exports.Run = async function Run(caller, guild) {
  if (!process.env.WEBHOOK_ID || !process.env.WEBHOOK_TOKEN || !process.env.VIP_ID || !process.env.VIP_TOKEN) return;
  const owner = caller.bot.users.get(guild.ownerID);
  caller.logger.info(
    `[guildDelete] ${guild.id} ${guild.name} ${guild.memberCount}`,
  );
  const bots = guild.members.filter((m) => m.user.bot).length;
  const normal = guild.features.length === 0;
  if (guild.features.indexOf('LURKABLE') !== -1) guild.features.splice(guild.features.indexOf('LURKABLE'), 1);
  const partnered = caller.utils.arraysEqual(guild.features, [
    'VIP_REGIONS',
    'VANITY_URL',
    'INVITE_SPLASH',
  ]);
  const verified = caller.utils.arraysEqual(guild.features, [
    'VIP_REGIONS',
    'VERIFIED',
    'VANITY_URL',
    'INVITE_SPLASH',
  ]);
  if (normal && guild.memberCount < 1000) {
    caller.bot
      .executeWebhook(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN, {
        username: caller.bot.user.username,
        embeds: [
          {
            color: 0xb31414,
            title: 'Left Guild',
            description: `**Name:** ${guild.name}\n**ID:** ${
              guild.id
            }\n**Owner:** ${owner.username}#${owner.discriminator} (${
              guild.ownerID
            })\n**Count:** ${
              guild.memberCount
            }\n**Users:** ${guild.memberCount -
              bots}\n**Bots:** ${bots}\n**Percent:** ${(
              (bots / guild.memberCount) *
              100
            ).toFixed(2)} %\n**Created:** ${caller.utils.snowflakeDate(
              guild.id,
            )}`,
            thumbnail: {
              url: guild.iconURL,
            },
            timestamp: new Date(),
          },
        ],
      })
      .catch(console.error);
  } else {
    const author = { name: 'Left ' };
    if (verified) {
      author.icon_url = 'https://cdn.discordapp.com/emojis/549209441220952064.png?v=1';
      author.name += 'Verified Guild';
    } else if (partnered) {
      author.icon_url = 'https://cdn.discordapp.com/emojis/540660679758184469.png?v=1';
      author.name += 'Partnered Guild';
    } else if (guild.features.length) {
      author.name += '???? Guild: Has Partial Features';
    } else author.name += 'Large Guild';
    caller.bot
      .executeWebhook(process.env.VIP_ID, process.env.VIP_TOKEN, {
        username: caller.bot.user.username,
        embeds: [
          {
            color: 0xb31414,
            author,
            description: `**Name:** ${guild.name}\n**ID:** ${
              guild.id
            }\n**Owner:** ${owner.username}#${owner.discriminator} (${
              guild.ownerID
            })\n**Count:** ${
              guild.memberCount
            }\n**Users:** ${guild.memberCount -
              bots}\n**Bots:** ${bots}\n**Percent:** ${(
              (bots / guild.memberCount) *
              100
            ).toFixed(2)} %\n**Created:** ${caller.utils.snowflakeDate(
              guild.id,
            )}`,
            thumbnail: {
              url: guild.iconURL,
            },
            timestamp: new Date(),
          },
        ],
      })
      .catch(console.error);
  }
};
