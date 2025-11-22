import pino from "pino";

const appLogStream = pino.destination({
  file: "logs/app.log",
  frequency: "daily",
  size: "10M",      // rotate when size > 10MB
  mkdir: true
});

const errorLogStream = pino.destination({
  file: "logs/error.log",
  frequency: "daily",
  size: "5M",
  mkdir: true
});

const logger = pino(
  {
    level: "info",
    transport:
      process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: { colorize: true }
          }
        : undefined
  },
  appLogStream
);

// dedicated error logger
export const errorLogger = pino(
  {
    level: "error"
  },
  errorLogStream
);

export default logger;
