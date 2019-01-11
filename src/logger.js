'use strict';

const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.prettyPrint(),
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} [${info.level}] ${info.message}`,
        ),
      ),
    }),
    new winston.transports.File({
      filename: 'events.log',
      maxsize: '10M',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.prettyPrint(),
        winston.format.printf(
          info => `${info.timestamp} [${info.level}] ${info.message}`,
        ),
      ),
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
