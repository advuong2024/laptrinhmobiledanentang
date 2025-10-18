const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../services/app.log");

function logToFile(message) {
  const time = new Date().toISOString();
  const fullMessage = `[${time}] ${message}\n`;
  fs.appendFileSync(logFile, fullMessage);
}

module.exports = { logToFile };
