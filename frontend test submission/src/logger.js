// frontend/src/logger.js
export async function Log(stack, level, pkg, message) {
  try {
    await fetch("http://20.244.56.144/evaluation-service/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });
  } catch (err) {
    console.error("Failed to send log:", err.message);
  }
}
