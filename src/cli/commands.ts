import { Command } from 'commander';
import { CLIOptions } from '../types/config.js';

export function setupCLI(): Command {
  const program = new Command();

  program
    .name('linear-concierge')
    .description(
      'Generate daily Linear issue briefs with intelligent categorization'
    )
    .version('1.0.0')
    .requiredOption('--out <path>', 'Output path for markdown file')
    .option(
      '--daysStale <number>',
      'Days since update to consider issue stale',
      '2'
    )
    .option(
      '--daysNoMove <number>',
      'Days since activity to consider not moving',
      '4'
    )
    .option(
      '--maxIssues <number>',
      'Maximum number of issues to fetch',
      '50'
    );

  return program;
}

export function parseOptions(program: Command): CLIOptions {
  const opts = program.opts();

  return {
    out: opts.out,
    daysStale: parseInt(opts.daysStale, 10),
    daysNoMove: parseInt(opts.daysNoMove, 10),
    maxIssues: parseInt(opts.maxIssues, 10),
  };
}
