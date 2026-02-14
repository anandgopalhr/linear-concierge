import { ClassificationResult, IssueCategory } from '../types/classification.js';
import { daysSince } from '../utils/date.js';

export class SeverityScorer {
  scoreIssues(results: ClassificationResult[]): ClassificationResult[] {
    return results.map((result) => ({
      ...result,
      severity: this.calculateSeverity(result),
    }));
  }

  private calculateSeverity(result: ClassificationResult): number {
    let score = 0;

    const priorityWeight =
      result.issue.priority === 0 ? 1 : 5 - result.issue.priority;
    score += priorityWeight * 10;

    const daysSinceUpdate = daysSince(result.issue.updatedAt);
    if (daysSinceUpdate > 7) score += 20;
    else if (daysSinceUpdate > 4) score += 15;
    else if (daysSinceUpdate > 2) score += 10;

    if (result.categories.includes(IssueCategory.CONFUSION)) score += 25;
    if (result.categories.includes(IssueCategory.NOT_MOVING)) score += 15;
    if (result.categories.includes(IssueCategory.STALE)) score += 10;

    if (
      result.issue.assignee &&
      result.categories.includes(IssueCategory.NOT_MOVING)
    ) {
      score += 10;
    }

    return score;
  }

  sortBySeverity(results: ClassificationResult[]): ClassificationResult[] {
    return [...results].sort((a, b) => b.severity - a.severity);
  }
}
