'use strict';

exports.Run = async function Run(caller, command, GUILD) {
  if (!command.msg.channel.guild) {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        description: ':warning: This command can\'t be used in DM',
        color: caller.color.yellow,
      },
    }).catch(console.error);
    return;
  }
  const guild = GUILD;
  const lang = caller.utils.getLang(guild);
  if (command.msg.author.id === process.env.OWNER || command.msg.member.permission.has('manageRoles')) {
    let list = lang.list.top;
    let list2 = '';
    let list3 = '';
    const IDS = [];
    guild.roles.forEach(async (item) => {
      if (IDS.indexOf(item.msg) === -1) {
        IDS.push(item.msg);
      }
    });
    let second = false;
    let third = false;
    IDS.forEach(async (id) => {
      const roles = guild.roles.filter(r => r.msg === id);
      roles.forEach(async (item) => {
        let type = 'Normal';
        let role = `<@&${item.id}>`;
        if (item.toggle) type = 'Toggled';
        if (item.once) type = 'Once';
        if (item.multi) {
          type = 'Multi';
          role = item.name;
        }
        if (item.remove) type = 'Remove';
        if (list.length < 1950) {
          list += `${(item.channel) ? `<#${item.channel}>` : `<#${guild.chan}>`} ~~-~~ ${item.msg} ~~-~~ ${type} ~~-~~ ${item.emoji} ~~-~~ ${role}\n`;
        } else if (list2.length < 1950) {
          second = true;
          list2 += `${(item.channel) ? `<#${item.channel}>` : `<#${guild.chan}>`} ~~-~~ ${item.msg} ~~-~~ ${type} ~~-~~ ${item.emoji} ~~-~~ ${role}\n`;
        } else {
          third = true;
          list3 += `${(item.channel) ? `<#${item.channel}>` : `<#${guild.chan}>`} ~~-~~ ${item.msg} ~~-~~ ${type} ~~-~~ ${item.emoji} ~~-~~ ${role}\n`;
        }
      });
    });
    caller.utils.message(command.msg.channel.id, {
      embed: {
        color: caller.color.blue,
        title: `${command.msg.channel.guild.name} ${lang.list.title}`,
        description: list,
      },
    }).catch(console.error);
    if (second) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          title: `${command.msg.channel.guild.name} ${lang.list.cont}`,
          description: list2,
        },
      }).catch(console.error);
    }
    if (third) {
      caller.utils.message(command.msg.channel.id, {
        embed: {
          color: caller.color.blue,
          title: `${command.msg.channel.guild.name} ${lang.list.cont}`,
          description: list3,
        },
      }).catch(console.error);
    }
  } else {
    caller.utils.message(command.msg.channel.id, {
      embed: {
        title: lang.titleError,
        description: lang.perm.noPerm,
        color: caller.color.yellow,
      },
    }).catch(console.error);
  }
};

exports.Settings = function Settings() {
  return {
    show: true,
    category: 'role',
  };
};
