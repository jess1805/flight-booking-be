import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, json, errors, colorize, printf } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}]: ${message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  defaultMeta: { service: 'flight-booking-api' },
  transports: [
    new winston.transports.Console({
      format:
        config.NODE_ENV === 'production'
          ? combine(timestamp(), errors({ stack: true }), json())
          : combine(colorize(), timestamp(), errors({ stack: true }), devFormat),
    }),
  ],
});
