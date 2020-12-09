import winston, { format } from "winston";

const customFormat = format.combine(
  format.timestamp(),
  format.printf((info) => {
    return `${info.timestamp} [${info.level.padEnd(7).toUpperCase()}]: ${
      info.message
    }`;
  })
);

const destinations: any = [new winston.transports.Console()];
if (process.env.NODE_ENV === "production") {
  destinations.push(
    new winston.transports.File({ filename: "app.log", level: "error" })
  );
}
const logger = winston.createLogger({
  transports: destinations,
  level: "debug",
  format: customFormat,
  silent: process.env.NODE_ENV === "test" || process.env.NODE_ENV === "staging",
});

export default logger;
