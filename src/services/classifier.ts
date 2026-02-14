import { NormalizedIssue } from '../types/issue.js';
import { ClassificationResult, IssueCategory } from '../types/classification.js';
import { daysSince, isWithinDays } from '../utils/date.js';

export interface ClassificationThresholds {
  daysStale: number;
  daysNoMove: number;
}

export class IssueClassifier {
  private readonly CONFUSION_KEYWORDS = [
    'confused',
    'unclear',
    'not sure',
    'help',
    'stuck',
    'blocked',
    'why',
    'how do',
    'clarify',
    'understand',
    'confusing',
    'reproduce',
    'repro',
    'waiting',
  ];

  constructor(private thresholds: ClassificationThresholds) {}

  classifyIssues(issues: NormalizedIssue[]): ClassificationResult[] {
    return issues.map((issue) => this.classifyIssue(issue));
  }

  private classifyIssue(issue: NormalizedIssue): ClassificationResult {
    const categories: IssueCategory[] = [];
    const reasons: string[] = [];

    const isClosed =
      issue.state.type === 'completed' || issue.state.type === 'canceled';
    const daysSinceUpdate = daysSince(issue.updatedAt);
    const daysSinceLastComment = this.getDaysSinceLastComment(issue);

    if (isClosed && isWithinDays(issue.updatedAt, 14)) {
      categories.push(IssueCategory.CLOSED_RECENTLY);
      reasons.push(`Closed ${daysSinceUpdate}d ago`);
      return {
        issue,
        categories,
        severity: 0,
        reasons,
      };
    }

    if (isClosed) {
      return {
        issue,
        categories: [],
        severity: 0,
        reasons: ['Closed'],
      };
    }

    if (daysSinceUpdate >= this.thresholds.daysStale) {
      categories.push(IssueCategory.STALE);
      reasons.push(`No updates for ${daysSinceUpdate}d`);
    }

    if (
      daysSinceUpdate >= this.thresholds.daysNoMove ||
      daysSinceLastComment >= this.thresholds.daysNoMove
    ) {
      categories.push(IssueCategory.NOT_MOVING);
      reasons.push(
        `No activity for ${Math.max(daysSinceUpdate, daysSinceLastComment)}d`
      );
    }

    const confusionScore = this.calculateConfusionScore(issue);
    if (confusionScore.keywordHits >= 2 || confusionScore.questionMarks >= 3) {
      categories.push(IssueCategory.CONFUSION);
      reasons.push(
        `Confusion: ${confusionScore.keywordHits} keywords, ${confusionScore.questionMarks} questions`
      );
    }

    if (issue.state.type === 'started' && categories.length === 0) {
      categories.push(IssueCategory.IN_PROGRESS);
      reasons.push('Actively in progress');
    }

    if (
      categories.includes(IssueCategory.STALE) ||
      categories.includes(IssueCategory.NOT_MOVING) ||
      categories.includes(IssueCategory.CONFUSION)
    ) {
      categories.push(IssueCategory.NEEDS_ATTENTION);
    }

    return {
      issue,
      categories,
      severity: 0,
      reasons,
    };
  }

  private getDaysSinceLastComment(issue: NormalizedIssue): number {
    if (issue.comments.length === 0) {
      return daysSince(issue.createdAt);
    }
    const lastComment = issue.comments[issue.comments.length - 1];
    return daysSince(lastComment.createdAt);
  }

  private calculateConfusionScore(issue: NormalizedIssue): {
    keywordHits: number;
    questionMarks: number;
  } {
    const recentComments = issue.comments.slice(-20);
    let keywordHits = 0;
    let questionMarks = 0;

    for (const comment of recentComments) {
      const bodyLower = comment.body.toLowerCase();

      for (const keyword of this.CONFUSION_KEYWORDS) {
        if (bodyLower.includes(keyword)) {
          keywordHits++;
        }
      }

      questionMarks += (comment.body.match(/\?/g) || []).length;
    }

    return { keywordHits, questionMarks };
  }
}
