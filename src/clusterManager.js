'use strict';

const request = require('request');
const logger = require('./logger');

class ClusterManager {
  constructor(cluster, shards, clusters) {
    this.clusters = new Map();
    this.cluster = cluster;
    this.numberOfShards = shards;
    this.numberOfClusters = clusters;
    this.exit = false;
    this.isRestart = false;
    this.queue = new Map();
    this.stats = {};

    if (process.env.ID) {
      logger.info('[Cluster] Posting 600000ms');
      setInterval(this.PostStats, 600000, this);
    }

    cluster.on('online', (worker) => {
      this.onOnlineWorker(worker);
    });

    cluster.on('exit', (deadWorker, code, signal) => {
      this.onDeadWorker(deadWorker, code || signal);
    });

    process.on('SIGINT', () => {
      this.exit = true;
      Object.keys(cluster.workers).forEach((k) => {
        cluster.workers[k].kill('SIGINT');
      });
    });

    setInterval(this.Cachet, 120000, this);

    this.cluster.on('message', async (worker, data) => {
      switch (data.name) {
        case 'user': {
          this.Find(1, data.name, data.id);
          const obj = {
            worker: worker.id,
          };
          this.clusters.forEach((d, i) => {
            obj[i - 1] = null;
          });
          this.queue.set(data.id, obj);
          break;
        }
        case 'guild':
          this.Find(1, data.name, data.id);
          this.queue.set(data.id, {
            worker: worker.id,
          });
          break;
        case 'return': {
          const queue = this.queue.get(data.id);
          queue[data.cluster] = data.data;
          this.queue.set(data.id, queue);
          let all = true;
          Object.keys(queue).forEach((key) => {
            if (this.clusters.get(parseInt(key, 10))) {
              if (queue[key] === null) all = false;
            }
          });
          if (!all) return;
          data.data = queue;
          const requester = this.clusters.get(queue.worker);
          if (requester) {
            requester.worker.send({
              name: 'res',
              id: data.id,
              data: data.data,
              cluster: data.cluster,
            });
            this.queue.delete(data.id);
          }
          break;
        }
        case 'stats':
          this.stats[data.data.cluster] = data.data;
          break;
        case 'getStats':
          worker.send({
            name: 'return',
            id: data.id,
            data: this.stats,
            cluster: 'master',
          });
          break;
        case 'restartCluster': {
          this.isRestart = true;
          let foundCluster;
          this.clusters.forEach((c) => {
            if (`${c.id}` === data.id) foundCluster = c;
          });
          if (foundCluster) {
            foundCluster.worker.process.kill();
            this.createNewWorker({
              firstShardID: foundCluster.firstShardID,
              lastShardID: foundCluster.lastShardID,
              maxShards: this.numberOfShards,
              cluster: foundCluster.id,
            });
            worker.send({
              name: 'return',
              id: data.id,
              data: `Restarting Cluster ${foundCluster.id}`,
              cluster: 'master',
            });
          } else {
            worker.send({
              name: 'return',
              id: data.id,
              data: 'Cluster Not Found',
              cluster: 'master',
            });
          }
          break;
        }
        case 'loadLanguage': {
          this.clusters.forEach((c) => {
            c.worker.send({
              name: 'language',
              code: data.code,
            });
          });
          break;
        }
        case 'reloadLanguages': {
          this.clusters.forEach((c) => {
            c.worker.send({
              name: 'reload',
            });
          });
          break;
        }
        default:
      }
    });
  }

  start() {
    logger.info(`[Cluster] Starting ${this.numberOfShards} shards over ${this.numberOfClusters} clusters`);
    let offset = 0;
    let shards = this.numberOfShards;
    let clusters = this.numberOfClusters;
    const clusterArray = [];
    while (shards > 0 && clusters > 0) {
      const a = Math.floor(shards / clusters);
      shards -= a;
      clusters--;
      clusterArray.push(a);
    }
    clusterArray.forEach(async (item, index) => {
      this.stats[index] = {
        messages: 0,
        commands: 0,
        users: 0,
        bot: 0,
        guilds: 0,
        memory: 0,
        uptime: '0 seconds',
        cluster: index,
      };
      this.createNewWorker({
        firstShardID: offset,
        lastShardID: offset + item - 1,
        maxShards: this.numberOfShards,
        cluster: index,
      });
      offset += item;
    });
  }

  restart() {
    logger.info('[Cluster] Restart');
    this.clusters = {};
    this.cluster.disconnect(() => this.start());
  }

  createNewWorker({ firstShardID, lastShardID, maxShards, cluster }) {
    logger.info(`[Cluster] Created Cluster ${cluster} created with shards ${firstShardID} - ${lastShardID} of ${maxShards} shards`);
    const worker = this.cluster.fork({
      firstShardID,
      lastShardID,
      maxShards,
      cluster,
    });
    this.clusters.set(worker.id, {
      worker,
      id: cluster,
      firstShardID,
      lastShardID,
    });
  }

  onOnlineWorker(worker) {
    const cluster = this.clusters.get(worker.id);
    logger.info(`[Cluster] Online ID: ${cluster.id} - Cluster ${cluster.id} shards ${cluster.firstShardID} - ${cluster.lastShardID}`);
  }

  onDeadWorker(deadWorker, reason) {
    if (this.exit) return;
    if (this.isRestart) {
      this.isRestart = false;
      return;
    }
    const cluster = this.clusters.get(deadWorker.id);
    logger.warn(`[Cluster] Died ID: ${deadWorker.id} - Cluster ${cluster.id} died: ${reason}`);
    if (!this.clusters.get(deadWorker.id)) {
      logger.error(`[Cluster] Not Found ID: ${deadWorker.id} - Cluster ${cluster.id}`);
      this.restart();
    } else {
      const deadCluster = this.clusters.get(deadWorker.id);
      this.createNewWorker({
        firstShardID: deadCluster.firstShardID,
        lastShardID: deadCluster.lastShardID,
        maxShards: this.numberOfShards,
        cluster: deadCluster.id,
      });
    }
  }

  Find(id, type, value) {
    const worker = this.clusters.get(id);
    if (worker) {
      worker.worker.send({
        name: type,
        value,
      });
      this.Find(id + 1, type, value);
    }
  }

  PostStats(self) {
    let count = 0;
    Object.keys(self.stats).forEach((key) => {
      count += self.stats[key].guilds.length;
    });
    logger.info(`[Cluster] Guild count: ${count}`);
    if (process.env.DBL) {
      request({
        uri: `https://discordbots.org/api/bots/${process.env.ID}/stats`,
        headers: {
          Authorization: process.env.DBL,
        },
        json: true,
        method: 'POST',
        body: {
          server_count: count,
        },
      })
        .on('complete', () => logger.info('[Cluster] discordbots.org posted'))
        .on('error', (e) => {
          console.error(e);
        });
    }
    if (process.env.BOD) {
      request({
        uri: `https://bots.ondiscord.xyz/bot-api/bots/${process.env.ID}/guilds`,
        headers: {
          Authorization: process.env.BOD,
        },
        json: true,
        method: 'POST',
        body: {
          guildCount: count,
        },
      })
        .on('complete', () => logger.info('[Cluster] bots.ondiscord.xyz posted'))
        .on('error', (e) => {
          console.error(e);
        });
    }
    if (process.env.DDBL) {
      request({
        uri: `https://divinediscordbots.com/bots/${process.env.ID}/stats`,
        headers: {
          Authorization: process.env.DDBL,
        },
        json: true,
        method: 'POST',
        body: {
          server_count: count,
        },
      })
        .on('complete', () => logger.info('[Cluster] divinediscordbots.com posted'))
        .on('error', (e) => {
          console.error(e);
        });
    }
    if (process.env.DBL2) {
      request({
        uri: `https://discordbotlist.com/api/bots/${process.env.ID}/stats`,
        headers: {
          Authorization: `Bot ${process.env.DBL2}`,
        },
        json: true,
        method: 'POST',
        body: {
          guilds: count,
        },
      })
        .on('complete', () => logger.info('[Cluster] discordbotlist.com posted'))
        .on('error', (e) => {
          console.error(e);
        });
    }
    if (process.env.B4D) {
      request({
        uri: `https://botsfordiscord.com/api/bot/${process.env.ID}`,
        headers: {
          Authorization: process.env.B4D,
        },
        json: true,
        method: 'POST',
        body: {
          server_count: count,
        },
      })
        .on('complete', () => logger.info('[Cluster] botsfordiscord.com posted'))
        .on('error', (e) => {
          console.error(e);
        });
    }
  }

  Cachet(caller) {
    request(
      {
        uri: `${process.env.CACHET_URL}/api/v1/components/groups`,
        method: 'GET',
      },
      (err, res, body) => {
        const { enabled_components } = JSON.parse(body).data[2];
        let shards = [];
        Object.keys(caller.stats).forEach((key) => {
          shards = shards.concat(caller.stats[key].status);
        });
        const components = [];
        let lastOrder = 0;
        enabled_components.forEach((component) => {
          if (component.order > lastOrder) lastOrder = component.order;
          shards.forEach((shard, index) => {
            if (component.name === `Shard ${shard.id}`) {
              component.shard = shard;
              components.push(component);
              shards.splice(index, 1);
            }
          });
        });
        shards.forEach((shard) => {
          caller.CreateComponent(shard, lastOrder);
        });
        components.forEach((component) => {
          caller.UpdateComponent(component);
        });
      },
    );
  }

  CreateComponent(shard, order) {
    request(
      {
        uri: `${process.env.CACHET_URL}/api/v1/components`,
        method: 'POST',
        headers: {
          'X-Cachet-Token': process.env.CACHET,
        },
        json: true,
        body: {
          name: `Shard ${shard.id}`,
          status: 1,
          group_id: 3,
          enabled: 'true',
          order: order + 1,
        },
      },
      (err) => {
        if (err) {
          console.error(err);
        } else logger.info(`[Cachet] Created Shard ${shard.id} Component`);
      },
    );
  }

  UpdateComponent(component) {
    let status = 1;
    const { shard } = component;
    if (shard.status === 'disconnected') status = 4;
    if (shard.status === 'handshaking') status = 2;
    if (shard.status === 'connecting') status = 3;
    request(
      {
        uri: `${process.env.CACHET_URL}/api/v1/components/${component.id}`,
        method: 'PUT',
        headers: {
          'X-Cachet-Token': process.env.CACHET,
        },
        json: true,
        body: {
          status,
        },
      },
      (err) => {
        if (err) {
          console.error(err);
        } else logger.info(`[Cachet] Update Shard ${shard.id} Component`);
      },
    );
  }
}

module.exports = ClusterManager;
