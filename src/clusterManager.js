'use strict';

const logger = require('disnode-logger');
const snekfetch = require('snekfetch');

class ClusterManager {
  constructor(cluster, shards, clusters) {
    this.clusters = new Map();
    this.cluster = cluster;
    this.numberOfShards = shards;
    this.numberOfClusters = clusters;
    this.exit = false;
    this.queue = new Map();
    this.stats = {};

    if (!process.env.TESTING && process.env.ID && process.env.DBL && process.env.DBOT) {
      setInterval(this.PostStats, 600000);
    }

    cluster.on('online', (worker) => {
      this.onOnlineWorker(worker);
    });

    cluster.on('exit', (deadWorker, code, signal) => {
      this.onDeadWorker(deadWorker, code || signal);
    });

    process.on('SIGINT', () => {
      this.exit = true;
      Object.keys(cluster.workers).forEach(k => cluster.workers[k].kill('SIGINT'));
    });

    this.cluster.on('message', async (worker, data) => {
      switch (data.name) {
        case 'info':
          logger.Info(data.title, data.code, data.message);
          break;
        case 'success':
          logger.Success(data.title, data.code, data.message);
          break;
        case 'warning':
          logger.Warning(data.title, data.code, data.message);
          break;
        case 'log':
          console.log(data.message);
          break;
        case 'user':
        case 'guild':
          this.Find(1, data.name, data.id);
          this.queue.set(data.id, worker.id);
          break;
        case 'return':
          {
            const queue = this.queue.get(data.id);
            const requester = this.clusters.get(queue);
            if (requester) {
              requester.worker.send({
                name: 'return',
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
        default:
      }
    });
  }

  start() {
    logger.Info('Cluster', 'Starting', `${this.numberOfShards} shards over ${this.numberOfClusters} clusters`);
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
        lastShardID: (offset + item) - 1,
        maxShards: this.numberOfShards,
        cluster: index,
      });
      offset += item;
    });
  }

  restart() {
    logger.Info('Cluster', 'Restart', '');
    this.clusters = {};
    this.cluster.disconnect(() => this.start());
  }

  createNewWorker({
    firstShardID,
    lastShardID,
    maxShards,
    cluster,
  }) {
    logger.Info('Cluster', 'Create', `Cluster ${cluster} created with shards ${firstShardID} - ${lastShardID} of ${maxShards} shards`);
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
    logger.Success('Cluster', 'Online', `ID: ${cluster.id} - Cluster ${cluster.id} shards ${cluster.firstShardID} - ${cluster.lastShardID}`);
  }

  onDeadWorker(deadWorker, reason) {
    if (this.exit) return;
    const cluster = this.clusters.get(deadWorker.id);
    logger.Warning('Cluster', 'Died', `ID: ${deadWorker.id} - Cluster ${cluster.id} died: ${reason}`);
    if (!this.clusters.get(deadWorker.id)) {
      logger.Error('Cluster', 'Not Found', `ID: ${deadWorker.id} - Cluster ${cluster.id}`);
      this.restart();
    } else {
      const deadCluster = this.clusters.get(deadWorker.id);
      this.clusters.delete(deadWorker.id);
      this.createNewWorker(deadCluster);
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

  PostStats() {
    let count = 0;
    Object.keys(this.stats).forEach((key) => {
      count += this.stats[key].guilds;
    });
    snekfetch.post(`https://discordbots.org/api/bots/${process.env.ID}/stats`)
      .set('Authorization', process.env.DBL)
      .send({
        server_count: count,
      })
      .then(() => logger.Success('Guild Count', 'DBL', `Guilds: ${count}`))
      .catch(err => console.error('Whoops something went wrong: ', err));
    snekfetch.post(`https://bots.discord.pw/api/bots/${process.env.ID}/stats`)
      .set('Authorization', process.env.DBOT)
      .send({
        server_count: count,
      })
      .then(() => logger.Success('Guild Count', 'DBOT', `Guilds: ${count}`))
      .catch(err => console.error('Whoops something went wrong: ', err));
  }
}

module.exports = ClusterManager;
