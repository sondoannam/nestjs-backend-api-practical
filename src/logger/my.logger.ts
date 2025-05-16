import { LoggerService, LogLevel } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import * as dayjs from 'dayjs';
import chalk from 'chalk';

export class MyLogger implements LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'debug',
      //   format: format.combine(
      //     format.colorize(),
      //     format.simple(),
      //     format.timestamp(),
      //   ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ context, message, level, time }) => {
              const strApp = chalk.green('[NestJS]');
              const strContext = chalk.yellow(`[${context}]`);

              return `${strApp} - ${time} ${level} ${strContext} | ${message}`;
            }),
          ),
        }),
        new transports.File({
          format: format.combine(format.timestamp(), format.json()),
          dirname: 'logs',
          filename: 'app.dev.log',
        }),
      ],
    });
  }

  private getCurrentTime() {
    return dayjs().format('YYYY/MM/DD, HH:mm:ss');
  }

  log(message: string, context: string) {
    const time = this.getCurrentTime();
    this.logger.info(message, { context, time });
  }
  error(message: string, context: string) {
    const time = this.getCurrentTime();
    this.logger.error(message, { context, time });
  }
  warn(message: string, context: string) {
    const time = this.getCurrentTime();
    this.logger.warn(message, { context, time });
  }
  debug?(message: string, context: string) {
    const time = this.getCurrentTime();
    this.logger.debug(message, { context, time });
  }
  verbose?(message: string, context: string) {
    const time = this.getCurrentTime();
    this.logger.verbose(message, { context, time });
  }
  fatal?(message: string, context: string) {
    this.logger.error(`====FATAL====[${context}] | ${message}`);
  }
  setLogLevels?(levels: LogLevel[]) {
    throw new Error(levels.join(', '));
  }
}
