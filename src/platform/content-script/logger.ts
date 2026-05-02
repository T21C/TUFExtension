const LOG_PREFIX = "[TUF Extension]";

export function logDebug(message: string, details?: unknown): void {
  writeLog("debug", message, details);
}

export function logInfo(message: string, details?: unknown): void {
  writeLog("info", message, details);
}

export function logWarn(message: string, details?: unknown): void {
  writeLog("warn", message, details);
}

export function logError(message: string, details?: unknown): void {
  writeLog("error", message, details);
}

function writeLog(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  details?: unknown,
): void {
  if (details === undefined) {
    console[level](`${LOG_PREFIX} ${message}`);
    return;
  }

  console[level](`${LOG_PREFIX} ${message}`, details);
}
