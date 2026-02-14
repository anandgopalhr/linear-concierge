export interface NormalizedIssue {
  id: string;
  identifier: string;
  title: string;
  url: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  state: {
    name: string;
    type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
  };
  assignee?: {
    name: string;
    email: string;
  };
  labels: string[];
  comments: IssueComment[];
}

export interface IssueComment {
  id: string;
  body: string;
  createdAt: Date;
  user: {
    name: string;
  };
}
