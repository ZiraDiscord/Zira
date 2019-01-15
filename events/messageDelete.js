'use strict';

exports.Run = async function Run(caller, data) {
  const guild = await caller.utils.getGuild(data.guild_id);
  let changed = false;
  if (guild.suggestions) {
    let suggestionArray = [];
    await guild.suggestions.forEach((obj, index) => {
      if (obj.message === data.id) {
        suggestionArray.push(index);
      } else if (data.ids && data.ids.indexOf(obj.message) !== -1) {
        suggestionArray.push(index);
      }
    });
    if (suggestionArray.length) {
      changed = true;
      suggestionArray = suggestionArray.reverse();
      suggestionArray.forEach((i) => {
        guild.suggestions.splice(i, 1);
      });
    }
  }
  let roleArray = [];
  await guild.roles.forEach((item, index) => {
    if (item.message === data.id) {
      roleArray.push(index);
    } else if (data.ids && data.ids.indexOf(item.msg) !== -1) {
      roleArray.push(index);
    }
  });
  if (roleArray.length) {
      changed = true;
      roleArray = roleArray.reverse();
    roleArray.forEach((i) => {
      guild.roles.splice(i, 1);
    });
  }
  if (changed) await caller.utils.updateGuild(guild);
};
