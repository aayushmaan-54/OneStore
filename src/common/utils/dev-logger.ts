/* eslint-disable @typescript-eslint/no-explicit-any */
const isDev = process.env.NODE_ENV !== "production";


export const devLogger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]) => {
    if (isDev) console.error(...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
};
