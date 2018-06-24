'use strict';

const EventEmitter = require('eventemitter3');

class IPC extends EventEmitter {
    async getGuild(id) {
        process.send({ name: 'guild', id });
        const self = this;
        return new Promise((resolve, reject) => {
            const callback = data => resolve({ cluster: data.cluster, guild: data.data });
            self.on(id, callback);
            setTimeout(() => {
                reject();
            }, 5000);
        });
    }

    async getUser(id) {
        process.send({ name: 'user', id });
        const self = this;
        return new Promise((resolve, reject) => {
            const callback = data => resolve({ cluster: data.cluster, user: data.data });
            self.on(id, callback);
            setTimeout(() => {
                reject();
            }, 5000);
        });
    }

    async getStats(id) {
        process.send({ name: 'getStats', id });
        const self = this;
        return new Promise((resolve, reject) => {
            const callback = data => resolve({ cluster: data.cluster, stats: data.data });
            self.on(id, callback);
            setTimeout(() => {
                reject();
            }, 5000);
        });
    }
}

module.exports = IPC;
