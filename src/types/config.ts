export interface CLIOptions {
  out: string;
  daysStale: number;
  daysNoMove: number;
  maxIssues: number;
}

export interface AppConfig {
  linearApiKey: string;
  outputPath: string;
  thresholds: {
    daysStale: number;
    daysNoMove: number;
    maxIssues: number;
  };
}
