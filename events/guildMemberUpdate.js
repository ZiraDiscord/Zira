'use strict';

exports.Run = async function Run(caller, guild, member, old) {
  const oldRoles = (old) ? old.roles : [];
  const newRoles = member.roles.map(r => r.id);
  const once = await caller.db.get('once');
  const claimedUser = await once.findOne({ id: member.user.id });
  const diff = [];
  if (claimedUser && claimedUser.claimed.length !== 0) {
    oldRoles.forEach(async (key) => {
      if (newRoles.indexOf(key) === -1) {
        diff.push(key);
      }
    });
    if (diff.length !== 0) {
      let change = false;
      diff.forEach(async (key) => {
        if (claimedUser.claimed.indexOf(key) !== -1) {
          change = true;
          claimedUser.claimed.splice(claimedUser.claimed.indexOf(key), 1);
        }
      });
      if (change) {
        once.findOneAndUpdate({ id: claimedUser.id }, claimedUser);
      }
    }
  }
};
