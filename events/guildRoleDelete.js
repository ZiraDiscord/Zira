'use strict';

exports.Run = async function Run(caller, guild, role) {
  const config = await caller.utils.getGuild(guild.id);
  let changed = false;
  config.roles.forEach((r, index) => {
    if (r.id === role.id) {
      caller.bot.removeMessageReaction(r.channel, r.message, r.emoji).catch(console.error);
      config.roles.splice(index, 1);
      changed = true;
    }
  });
  if (changed) await caller.utils.updateGuild(config);
};
