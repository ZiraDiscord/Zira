'use strict';

const cluster = require('cluster');
const logger = require('disnode-logger');
const Zira = require('./Zira.js');
const ClusterManager = require('./src/clusterManager.js');

process.on('uncaughtException', (err) => {
  logger.Error('Cluster', 'Error', err);
});
process.on('unhandledRejection', (err) => {
  logger.Error('Cluster', 'Error', err);
});

if (cluster.isMaster) {
  const clusterManager = new ClusterManager(cluster, process.env.SHARDS, process.env.CLUSTERS);
  clusterManager.start();
} else {
  const zira = new Zira({ // eslint-disable-line no-unused-vars
    firstShardID: parseInt(process.env.firstShardID, 10), // ¯\_(ツ)_/¯ These were appearntly strings so yea
    lastShardID: parseInt(process.env.lastShardID, 10),
    maxShards: parseInt(process.env.maxShards, 10),
    cluster: process.env.cluster,
  });
}
