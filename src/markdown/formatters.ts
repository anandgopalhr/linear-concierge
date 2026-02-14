import { ClassificationResult } from '../types/classification.js';
import { formatRelativeDate, daysSince } from '../utils/date.js';

export function formatIssue(result: ClassificationResult): string {
  const { issue } = result;

  let markdown = `### [${issue.identifier}](${issue.url}) ${issue.title}\n\n`;

  markdown += `- **State:** ${issue.state.name} (${issue.state.type})\n`;
  markdown += `- **Assignee:** ${issue.assignee ? issue.assignee.name : 'Unassigned'}\n`;
  markdown += `- **Priority:** ${formatPriority(issue.priority)}\n`;
  markdown += `- **Updated:** ${formatRelativeDate(issue.updatedAt)} (${daysSince(issue.updatedAt)}d ago)\n`;

  if (issue.comments.length > 0) {
    const lastComment = issue.comments[issue.comments.length - 1];
    markdown += `- **Last comment:** ${formatRelativeDate(lastComment.createdAt)} (${daysSince(lastComment.createdAt)}d ago)\n`;
  } else {
    markdown += `- **Last comment:** —\n`;
  }

  markdown += `- **Age:** ${daysSince(issue.createdAt)}d since creation\n`;

  if (issue.labels.length > 0) {
    markdown += `- **Labels:** ${issue.labels.join(', ')}\n`;
  } else {
    markdown += `- **Labels:** —\n`;
  }

  if (result.reasons.length > 0) {
    markdown += `- **Flags:** ${result.reasons.join(', ')}\n`;
  }

  markdown += '\n';

  return markdown;
}

export function formatIssueAsTableRow(result: ClassificationResult): string {
  const { issue } = result;

  const name = `[${issue.identifier}](${issue.url})`;
  const title = issue.title.length > 50 ? issue.title.substring(0, 47) + '...' : issue.title;
  const priority = formatPriority(issue.priority);

  let lastComment: string;
  if (issue.comments.length > 0) {
    const lastCommentDate = issue.comments[issue.comments.length - 1];
    lastComment = formatRelativeDate(lastCommentDate.createdAt);
  } else {
    lastComment = '—';
  }

  const updated = formatRelativeDate(issue.updatedAt);
  const age = `${daysSince(issue.createdAt)}d`;
  const reason = result.reasons.length > 0 ? result.reasons.join(', ') : '—';

  return `| ${name} ${title} | ${priority} | ${lastComment} | ${updated} | ${age} | ${reason} |\n`;
}

export function formatIssuesAsTable(results: ClassificationResult[]): string {
  if (results.length === 0) return '';

  let table = '| Name | Priority | Last Comment | Updated | Age | Reason |\n';
  table += '|------|----------|--------------|---------|-----|--------|\n';
  table += results.map((r) => formatIssueAsTableRow(r)).join('');
  table += '\n';

  return table;
}

function formatPriority(priority: number): string {
  const labels = ['None', 'Urgent', 'High', 'Medium', 'Low'];
  return labels[priority] || 'None';
}
