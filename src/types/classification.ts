import { NormalizedIssue } from './issue.js';

export interface ClassificationResult {
  issue: NormalizedIssue;
  categories: IssueCategory[];
  severity: number;
  reasons: string[];
}

export enum IssueCategory {
  STALE = 'stale',
  NOT_MOVING = 'not_moving',
  CONFUSION = 'confusion',
  IN_PROGRESS = 'in_progress',
  CLOSED_RECENTLY = 'closed_recently',
  NEEDS_ATTENTION = 'needs_attention',
}

export interface CategoryCounts {
  [IssueCategory.STALE]: number;
  [IssueCategory.NOT_MOVING]: number;
  [IssueCategory.CONFUSION]: number;
  [IssueCategory.IN_PROGRESS]: number;
  [IssueCategory.CLOSED_RECENTLY]: number;
  [IssueCategory.NEEDS_ATTENTION]: number;
  total: number;
}
