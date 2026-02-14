import { setupCLI, parseOptions } from './cli/commands.js';
import { loadConfiguration } from './utils/config.js';
import { LinearClient } from './linear/client.js';
import { IssueFetcher } from './services/issue-fetcher.js';
import { IssueClassifier } from './services/classifier.js';
import { SeverityScorer } from './services/severity-scorer.js';
import { MarkdownGenerator } from './markdown/generator.js';
import { LinearConciergeError } from './utils/errors.js';

async function main() {
  try {
    const program = setupCLI();
    program.parse();
    const cliOptions = parseOptions(program);

    console.log('🚀 Linear Concierge - Starting...\n');

    const config = loadConfiguration(cliOptions);
    console.log(`📂 Output path: ${config.outputPath}`);
    console.log(
      `📊 Fetching up to ${config.thresholds.maxIssues} subscribed issues...\n`
    );

    const linearClient = new LinearClient(config.linearApiKey);
    await linearClient.testConnection();
    console.log('');

    console.log('📥 Fetching subscribed issues from Linear...');
    const fetcher = new IssueFetcher(linearClient);
    const issues = await fetcher.fetchIssues(config.thresholds.maxIssues);
    console.log(`✓ Fetched ${issues.length} issues\n`);

    console.log('🔍 Classifying issues...');
    const classifier = new IssueClassifier({
      daysStale: config.thresholds.daysStale,
      daysNoMove: config.thresholds.daysNoMove,
    });
    let results = classifier.classifyIssues(issues);
    console.log('✓ Classification complete\n');

    console.log('📊 Calculating severity scores...');
    const scorer = new SeverityScorer();
    results = scorer.scoreIssues(results);
    console.log('✓ Severity scores calculated\n');

    console.log('📝 Generating markdown brief...');
    const generator = new MarkdownGenerator();
    const markdown = generator.generateMarkdown(results);
    console.log('✓ Markdown generated\n');

    console.log('💾 Writing to file...');
    generator.writeToFile(markdown, config.outputPath);

    console.log('\n✨ Done! Your Linear Concierge brief is ready.');
  } catch (error) {
    if (error instanceof LinearConciergeError) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    } else {
      console.error('\n❌ Unexpected error:', error);
      process.exit(1);
    }
  }
}

main();
