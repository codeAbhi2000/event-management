import pinoHttp from "pino-http";
import pino from "pino";

const httpLogStream = pino.destination({
  dest: "logs/http.log",
  sync: false,
  mkdir: true
});

export const httpLogger = pinoHttp({
  logger: pino(httpLogStream),
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url
      };
    },
    res(res) {
      return {
        status: res.statusCode
      };
    }
  }
});