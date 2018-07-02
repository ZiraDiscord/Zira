'use strict';

const numeral = require('numeral');
const table = require('text-table');

exports.Run = async function Run(caller, command) {
  const res = await caller.ipc.getStats(command.msg.id);
  if (command.params[0] === 'full') {
    const arr = [
      ['Cluster', 'Shards', 'Commands', 'Mesages', 'Guilds', 'Users', 'Bots', 'Memory', 'Uptime'],
    ];
    let totalShards = 0;
    let totalCommands = 0;
    let totalMessages = 0;
    let totalGuilds = 0;
    let totalUsers = 0;
    let totalBots = 0;
    let totalMemory = 0;
    Object.keys(res.stats).forEach((key) => {
      const cluster = res.stats[key];
      if (cluster.cluster === caller.id) {
        arr.push([`${cluster.cluster}*`, cluster.shards, numeral(cluster.commands).format('0,0'), numeral(cluster.messages).format('0,0'), numeral(cluster.guilds.length).format('0,0'), numeral(cluster.users).format('0,0'), numeral(cluster.bots).format('0,0'), cluster.memory, cluster.uptime]);
      } else {
        arr.push([`${cluster.cluster}`, cluster.shards, numeral(cluster.commands).format('0,0'), numeral(cluster.messages).format('0,0'), numeral(cluster.guilds.length).format('0,0'), numeral(cluster.users).format('0,0'), numeral(cluster.bots).format('0,0'), cluster.memory, cluster.uptime]);
      }
      totalShards += cluster.shards;
      totalCommands += cluster.commands;
      totalMessages += cluster.messages;
      totalGuilds += cluster.guilds.length;
      totalUsers += cluster.users;
      totalBots += cluster.bots;
      totalMemory += numeral(cluster.memory).value();
    });
    arr.push(['Total', totalShards, numeral(totalCommands).format('0,0'), numeral(totalMessages).format('0,0'), numeral(totalGuilds).format('0,0'), numeral(totalUsers).format('0,0'), numeral(totalBots).format('0,0'), numeral(totalMemory.toFixed(2)).format('0,0'), ' ']);
    caller.utils.message(command.msg.channel.id, `\`\`\`prolog\n${table(arr)}\n\`\`\``).catch(console.error);
    return;
  }
  const [cl] = await caller.db.Find('changelog', {
    id: 0,
  });
  let guilds = 0;
  Object.keys(res.stats).forEach((key) => {
    guilds += res.stats[key].guilds.length;
  });
  const embed = {
    embed: {
      color: caller.color.blue,
      fields: [{
        name: 'Version',
        inline: true,
        value: cl.version,
      }, {
        name: 'Guilds',
        inline: true,
        value: numeral(guilds).format('0,0'),
      }, {
        name: 'Library',
        inline: true,
        value: '[Eris](https://abal.moe/Eris/)',
      }, {
        name: 'Made By',
        inline: true,
        value: 'Hazed SPaCEx#2574',
      }],
      footer: {
        text: `Cluster: ${caller.id} Shard: ${(command.msg.channel.guild) ? command.msg.channel.guild.shard.id : 0} | Uptime: ${caller.utils.getTime(caller.bot.startTime)}`,
      },
    },
  };
  if (cl.changes) {
    embed.embed.fields.push({
      name: 'Changelog',
      value: cl.changelog,
      inline: true,
    });
  }
  caller.utils.message(command.msg.channel.id, embed).catch(console.error);
};

exports.Settings = function Settings() {
  return {
    show: true,
    category: 'misc',
  };
};
