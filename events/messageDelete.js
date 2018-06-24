'use strict';

exports.Run = async function Run(caller, data) {
  const guild = await caller.utils.getGuild(data.guild_id);
  let found = false;
  const foundArray = [];
  if (data.id) {
    if (guild.msgid.indexOf(data.id) !== -1) {
      found = true;
      foundArray.push(data.id);
    }
  } else {
    for (let i = 0; i < data.ids.length; i++) {
      if (guild.msgid.indexOf(data.ids[i]) !== -1) {
        found = true;
        foundArray.push(data.ids[i]);
      }
    }
  }
  if (!found) return;
  await foundArray.forEach(async (id) => {
    guild.msgid.splice(guild.msgid.indexOf(id), 1);
    guild.roles.forEach(async (item, index) => {
      console.log(item.msg === id);
      if (item.msg === id) {
        console.log(guild.roles[index]);
        guild.roles.splice(index, 1);
      }
    });
  });
  await caller.utils.updateGuild(guild);
};
