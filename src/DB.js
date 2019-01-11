'use strict';

const monk = require('monk');

module.exports = process.env.DB_URI ? monk(process.env.DB_URI) : null;
