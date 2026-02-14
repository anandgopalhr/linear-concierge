import { config as loadEnv } from 'dotenv';
import { AppConfig, CLIOptions } from '../types/config.js';
import { ConfigurationError } from './errors.js';

export function loadConfiguration(options: CLIOptions): AppConfig {
  loadEnv();

  const linearApiKey = process.env.LINEAR_API_KEY;
  if (!linearApiKey) {
    throw new ConfigurationError(
      'LINEAR_API_KEY not found in environment variables. Please set it in .env file.'
    );
  }

  return {
    linearApiKey,
    outputPath: options.out,
    thresholds: {
      daysStale: options.daysStale,
      daysNoMove: options.daysNoMove,
      maxIssues: options.maxIssues,
    },
  };
}
