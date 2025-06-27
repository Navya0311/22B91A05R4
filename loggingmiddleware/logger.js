// loggingmiddleware/logger.js

function Log(stack, level, pkg, message) {
  const logMessage = `[${new Date().toISOString()}] [${stack}] [${level.toUpperCase()}] [${pkg}] ${message}`;
  console.log(logMessage);

  // If you're sending logs to evaluation server, uncomment this:
  /*
  fetch('http://20.244.56.144/evaluation-service/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stack, level, message, timestamp: new Date().toISOString(), package: pkg })
  }).catch((err) => console.log("Failed to send log:", err.message));
  */
}

module.exports = { Log }; // ✅ CommonJS export
