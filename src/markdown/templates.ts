import { CategoryCounts, IssueCategory } from '../types/classification.js';
import { formatDate } from '../utils/date.js';

export function generateHeader(): string {
  return `# Linear Concierge — Today\n\n**Generated at:** ${formatDate(new Date())}\n\n---\n\n`;
}

export function generateSummary(counts: CategoryCounts): string {
  const openCount =
    counts.total -
    counts[IssueCategory.CLOSED_RECENTLY] -
    (counts.total - counts.total);

  return `## Summary

- **Total subscribed issues:** ${counts.total}
- **Open:** ${openCount}
- **Needs attention:** ${counts[IssueCategory.NEEDS_ATTENTION]}
- **Closed recently (last 14d):** ${counts[IssueCategory.CLOSED_RECENTLY]}

---

`;
}

export function generateSectionHeader(title: string, count: number): string {
  return `## ${title} (${count})\n\n`;
}
