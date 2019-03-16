'use strict';

const queue = new Map();

class IPC {
  constructor() {
    process.on('message', (data) => {
      if (queue.get(data.id)) {
        queue.get(data.id)(data);
        queue.delete(data.id);
      }
    });
  }

  getGuild(id) {
    process.send({ name: 'guild', id });
    return new Promise((resolve, reject) => {
      queue.set(id, resolve);
      setTimeout(() => {
        queue.delete(id);
        reject();
      }, 5000);
    });
  }

  getUser(id) {
    process.send({ name: 'user', id });
    return new Promise((resolve, reject) => {
      queue.set(id, resolve);
      setTimeout(() => {
        queue.delete(id);
        reject();
      }, 5000);
    });
  }

  getStats(id) {
    process.send({ name: 'getStats', id });
    return new Promise((resolve, reject) => {
      queue.set(id, resolve);
      setTimeout(() => {
        queue.delete(id);
        reject();
      }, 5000);
    });
  }

  restartCluster(id) {
    process.send({ name: 'restartCluster', id });
    return new Promise((resolve, reject) => {
      queue.set(id, resolve);
      setTimeout(() => {
        queue.delete(id);
        reject();
      }, 5000);
    });
  }
}

module.exports = IPC;
