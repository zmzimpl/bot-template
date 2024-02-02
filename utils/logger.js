import { existsSync, mkdirSync } from "fs";
import * as winston from "winston";

const colorizer = winston.format.colorize();

export function createLogger(label) {
  if (!winston.loggers.has(label)) {
    let transport;
    if (!existsSync("logs")) {
      mkdirSync("logs");
    }
    if (!existsSync(`logs/${label}`)) {
      mkdirSync(`logs/${label}`);
    }
    const date = new Date();

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    // 定义日志文件的位置，每天记录一个日志文件
    const logFile = `logs/${label}/${formattedDate}.log`;
    // 生产环境: 所有日志都输出到文件
    transport = new winston.transports.File({
      level: "info",
      filename: logFile,
    });

    winston.loggers.add(label, {
      transports: [transport],
      format: winston.format.combine(
        winston.format.label({ label }),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf((info) => {
          const {
            timestamp,
            level,
            message,
            [Symbol.for("splat")]: splat,
          } = info;
          const metaString =
            splat && splat.length ? splat.map(JSON.stringify).join(" ") : "";
          const formattedMessage = `${message} ${metaString}`.trim();
          return isDevelopment
            ? colorizer.colorize(
                level,
                `${label} | ${timestamp} - ${level}: ${formattedMessage}`
              )
            : `${label} | ${timestamp} - ${level}: ${formattedMessage}`;
        })
      ),
    });
  }
  return winston.loggers.get(label);
}
