import pino from "pino";
import fs from "fs";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Use standard fs streams instead of pino.destination
const appLogStream = fs.createWriteStream(
  path.join(logsDir, "app.log"),
  { flags: "a" }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, "error.log"),
  { flags: "a" }
);

const logger = pino(appLogStream);
export const errorLogger = pino({ level: "error" }, errorLogStream);

export default logger;