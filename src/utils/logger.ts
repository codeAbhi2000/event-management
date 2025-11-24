import pino from "pino";

// Note: pino.destination doesn't support 'file', 'frequency', or 'size'
// Use 'dest' for file path, and consider pino-roll for rotation

const appLogStream = pino.destination({
  dest: "logs/app.log",
  sync: false,
  mkdir: true
});

const errorLogStream = pino.destination({
  dest: "logs/error.log",
  sync: false,
  mkdir: true
});

// Main logger
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
  // Only use destination when NOT using transport
  process.env.NODE_ENV === "development" ? undefined : appLogStream
);

// Dedicated error logger
export const errorLogger = pino(
  {
    level: "error"
  },
  errorLogStream
);

export default logger;