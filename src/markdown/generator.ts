import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import {
  ClassificationResult,
  IssueCategory,
  CategoryCounts,
} from '../types/classification.js';
import { generateHeader, generateSummary, generateSectionHeader } from './templates.js';
import { formatIssue, formatIssuesAsTable } from './formatters.js';
import { FileWriteError } from '../utils/errors.js';

export class MarkdownGenerator {
  generateMarkdown(results: ClassificationResult[]): string {
    const counts = this.calculateCounts(results);

    let markdown = generateHeader();
    markdown += generateSummary(counts);

    const needsAttention = results
      .filter((r) => r.categories.includes(IssueCategory.NEEDS_ATTENTION))
      .sort((a, b) => b.severity - a.severity);

    if (needsAttention.length > 0) {
      markdown += generateSectionHeader('Needs attention now', needsAttention.length);
      markdown += formatIssuesAsTable(needsAttention);
    }

    const notMoving = results.filter(
      (r) =>
        r.categories.includes(IssueCategory.NOT_MOVING) &&
        !r.categories.includes(IssueCategory.CLOSED_RECENTLY)
    );

    const stale = results.filter(
      (r) =>
        r.categories.includes(IssueCategory.STALE) &&
        !r.categories.includes(IssueCategory.NOT_MOVING) &&
        !r.categories.includes(IssueCategory.CLOSED_RECENTLY)
    );

    if (notMoving.length > 0 || stale.length > 0) {
      markdown += generateSectionHeader(
        'Not moving / stale',
        notMoving.length + stale.length
      );

      if (notMoving.length > 0) {
        markdown += '### Not moving\n\n';
        markdown += formatIssuesAsTable(notMoving);
      }

      if (stale.length > 0) {
        markdown += '### Stale\n\n';
        markdown += formatIssuesAsTable(stale);
      }
    }

    const confusion = results.filter(
      (r) =>
        r.categories.includes(IssueCategory.CONFUSION) &&
        !r.categories.includes(IssueCategory.CLOSED_RECENTLY)
    );

    if (confusion.length > 0) {
      markdown += generateSectionHeader(
        'Internal confusion / churn signals',
        confusion.length
      );
      markdown += formatIssuesAsTable(confusion);
    }

    const inProgress = results.filter(
      (r) =>
        r.categories.includes(IssueCategory.IN_PROGRESS) &&
        !r.categories.includes(IssueCategory.NEEDS_ATTENTION) &&
        !r.categories.includes(IssueCategory.CLOSED_RECENTLY)
    );

    if (inProgress.length > 0) {
      markdown += generateSectionHeader('In progress (healthy)', inProgress.length);
      markdown += formatIssuesAsTable(inProgress);
    }

    const closedRecently = results.filter((r) =>
      r.categories.includes(IssueCategory.CLOSED_RECENTLY)
    );

    if (closedRecently.length > 0) {
      markdown += generateSectionHeader('Closed recently', closedRecently.length);
      markdown += formatIssuesAsTable(closedRecently);
    }

    return markdown;
  }

  writeToFile(markdown: string, outputPath: string): void {
    try {
      const dir = dirname(outputPath);
      mkdirSync(dir, { recursive: true });

      writeFileSync(outputPath, markdown, 'utf-8');
      console.log(`\nMarkdown brief written to: ${outputPath}`);
    } catch (error) {
      throw new FileWriteError(
        `Failed to write markdown file: ${(error as Error).message}`,
        outputPath
      );
    }
  }

  private calculateCounts(results: ClassificationResult[]): CategoryCounts {
    const counts: CategoryCounts = {
      [IssueCategory.STALE]: 0,
      [IssueCategory.NOT_MOVING]: 0,
      [IssueCategory.CONFUSION]: 0,
      [IssueCategory.IN_PROGRESS]: 0,
      [IssueCategory.CLOSED_RECENTLY]: 0,
      [IssueCategory.NEEDS_ATTENTION]: 0,
      total: results.length,
    };

    for (const result of results) {
      for (const category of result.categories) {
        counts[category]++;
      }
    }

    return counts;
  }
}
