import { LinearClient as SDK, Issue } from '@linear/sdk';
import { LinearAPIError } from '../utils/errors.js';

export class LinearClient {
  private sdk: SDK;

  constructor(apiKey: string) {
    this.sdk = new SDK({ apiKey });
  }

  async testConnection(): Promise<boolean> {
    try {
      const viewer = await this.sdk.viewer;
      console.log(`Connected to Linear as: ${viewer.name} (${viewer.email})`);
      return true;
    } catch (error) {
      throw new LinearAPIError(
        'Failed to connect to Linear API. Check your API key.',
        error as Error
      );
    }
  }

  async getSubscribedIssues(maxIssues: number): Promise<Issue[]> {
    try {
      const viewer = await this.sdk.viewer;

      const query = `
        query SubscribedIssues($userId: ID!, $first: Int!) {
          issues(
            filter: {
              and: [
                { subscribers: { id: { eq: $userId } } }
                { assignee: { id: { neq: $userId } } }
              ]
            }
            first: $first
            orderBy: updatedAt
          ) {
            nodes {
              id
            }
          }
        }
      `;

      const variables = {
        userId: viewer.id,
        first: maxIssues,
      };

      const response = await this.sdk.client.rawRequest(query, variables);
      const issueIds = (response.data as any).issues.nodes.map((n: any) => n.id);

      const issueNodes: Issue[] = [];
      for (const issueId of issueIds) {
        const issue = await this.sdk.issue(issueId);
        issueNodes.push(issue);
      }

      return issueNodes;
    } catch (error) {
      throw new LinearAPIError(
        'Failed to fetch subscribed issues from Linear.',
        error as Error
      );
    }
  }
}
