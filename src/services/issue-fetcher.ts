import { LinearClient } from '../linear/client.js';
import { NormalizedIssue, IssueComment } from '../types/issue.js';

export class IssueFetcher {
  constructor(private client: LinearClient) {}

  async fetchIssues(maxIssues: number): Promise<NormalizedIssue[]> {
    const rawIssues = await this.client.getSubscribedIssues(maxIssues);

    // Process all issues in parallel
    const normalized = await Promise.all(
      rawIssues.map(async (issue) => {
        // Fetch all issue data in parallel
        const [state, assignee, labels, comments] = await Promise.all([
          issue.state,
          issue.assignee,
          issue.labels(),
          issue.comments(),
        ]);

        const labelNodes = labels?.nodes || [];
        const commentNodes = comments?.nodes || [];

        return {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          url: issue.url,
          priority: issue.priority ?? 0,
          createdAt: new Date(issue.createdAt),
          updatedAt: new Date(issue.updatedAt),
          state: {
            name: state?.name ?? 'Unknown',
            type: (state?.type as any) ?? 'unstarted',
          },
          assignee: assignee
            ? {
                name: assignee.name,
                email: assignee.email,
              }
            : undefined,
          labels: labelNodes.map((l) => l.name),
          comments: await this.normalizeComments(commentNodes),
        };
      })
    );

    return normalized;
  }

  private async normalizeComments(comments: any[]): Promise<IssueComment[]> {
    // Process all comments in parallel
    const normalized = await Promise.all(
      comments.map(async (comment) => {
        const user = await comment.user;
        return {
          id: comment.id,
          body: comment.body ?? '',
          createdAt: new Date(comment.createdAt),
          user: {
            name: user?.name ?? 'Unknown',
          },
        };
      })
    );

    // Sort comments by creation date (oldest first)
    // This ensures the last comment in the array is the most recent
    return normalized.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
