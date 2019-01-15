'use strict';

const cluster = require('cluster');
const Zira = require('./Zira.js');
const ClusterManager = require('./src/clusterManager.js');

process.on('uncaughtException', (err) => {
  console.error(err);
});
process.on('unhandledRejection', (err) => {
  console.error(err);
});

if (cluster.isMaster) {
  const clusterManager = new ClusterManager(cluster, process.env.SHARDS, process.env.CLUSTERS);
  clusterManager.start();
} else {
  // eslint-disable-next-line no-unused-vars
  const zira = new Zira({
    firstShardID: parseInt(process.env.firstShardID, 10),
    lastShardID: parseInt(process.env.lastShardID, 10),
    maxShards: parseInt(process.env.maxShards, 10),
    cluster: parseInt(process.env.cluster, 10),
  });
}
