let debugCallback = (message: string, data: {}) => {
  // Default implementation does nothing or logs to console
  console.log(`DEBUG: ${message}`, data)
};

export const debugService = {
  setLogFunction: (logFn: (message: string, data: {}) => void) => {
    debugCallback = logFn
  },
  log: (message: string, data = {}) => {
    debugCallback(message, data)
  }
}
