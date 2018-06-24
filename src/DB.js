'use strict';

const mongo = require('mongodb').MongoClient;
const log = require('disnode-logger');

this.db = null;
module.exports.Connect = async () => {
  const self = this;
  return new Promise((resolve) => {
    mongo.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`).then((db) => {
      if (self.int != null) {
        clearInterval(self.int);
        self.int = null;
      }
      self.db = db;
      self.db.on('close', () => {
        log.Error('DB', 'Disconnect', 'Disconnected from DB! Attempting Reconnect!');
        self.AttemptReconnect();
      });
      log.Success('DB', 'Connect', 'Connected to DB!');
      resolve();
    });
  });
};

module.exports.Update = (collection, identifier, newData) => {
  const self = this;
  return new Promise((resolve, reject) => {
    const _collection = self.db.collection(collection);
    _collection.updateOne(identifier, {
      $set: newData,
    }, {
      upsert: true,
    }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

module.exports.Find = (collection, search) => {
  const self = this;
  return new Promise((resolve, reject) => {
    const _collection = self.db.collection(collection);
    _collection.find(search, (err, docs) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(docs.toArray());
    });
  });
};

module.exports.AttemptReconnect = () => {
  this.int = setInterval(() => {
    log.Success('DB', 'Reconnect', 'Attempting to reconnect.');
    this.Connect();
  }, 5000);
};

module.exports.Insert = (collection, data) => {
  const self = this;
  return new Promise((resolve, reject) => {
    const _collection = self.db.collection(collection);
    _collection.insert(data, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

module.exports.Delete = (collection, search) => {
  const self = this;
  return new Promise((resolve, reject) => {
    const _collection = self.db.collection(collection);
    _collection.deleteOne(search, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

module.exports.GetDB = () => this.db;
