import chalk from 'chalk';

const timestamp = () => new Date().toLocaleTimeString('en-US', { hour12: false });

export const logger = {
  info: (...args) => console.log(chalk.blue(`[${timestamp()}] [INFO]`), ...args),
  success: (...args) => console.log(chalk.green(`[${timestamp()}] [OK]`), ...args),
  warn: (...args) => console.log(chalk.yellow(`[${timestamp()}] [WARN]`), ...args),
  error: (...args) => console.log(chalk.red(`[${timestamp()}] [ERROR]`), ...args),
  debug: (...args) => console.log(chalk.gray(`[${timestamp()}] [DEBUG]`), ...args),
};