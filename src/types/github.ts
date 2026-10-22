/**
 * Core GitHub & API TypeScript interfaces
 */

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name?: string;
  bio?: string;
  public_repos: number;
  total_private_repos?: number;
  followers?: number;
  following?: number;
  html_url: string;
}

export interface Repository {
  id?: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url?: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  created_at?: string;
  updated_at?: string;
  pushed_at?: string;
  visibility?: string;
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url?: string;
  };
  protected?: boolean;
}

export interface PullRequest {
  id?: number;
  number: number;
  state: 'open' | 'closed';
  title: string;
  body: string | null;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  merged_at?: string | null;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  draft?: boolean;
}

export interface Issue {
  id?: number;
  number: number;
  state: 'open' | 'closed';
  title: string;
  body: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description?: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  html_url: string;
}

export interface CommitItem {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer?: {
      name: string;
      date: string;
    };
    message: string;
  };
  author?: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
}

export interface ContentItem {
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  name: string;
  path: string;
  sha: string;
  size: number;
  html_url?: string;
  download_url?: string;
  encoding?: string;
  content?: string;
  decoded_content?: string;
}

export interface Workflow {
  id: number;
  name: string;
  path: string;
  state: string;
  created_at?: string;
  updated_at?: string;
  html_url?: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'queued' | 'waiting' | string;
  conclusion: 'success' | 'failure' | 'cancelled' | 'neutral' | 'skipped' | null | string;
  workflow_id: number;
  html_url: string;
  event: string;
  head_branch: string;
  head_sha: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  actor?: {
    login: string;
    avatar_url: string;
  };
}

export interface WorkflowRunLogs {
  run_id: number;
  total_count: number;
  jobs: Array<{
    id: number;
    name: string;
    status: string;
    conclusion: string;
    steps?: Array<{
      name: string;
      status: string;
      conclusion: string;
      number: number;
    }>;
  }>;
  archive_url: string;
}

export interface OperationLog {
  id: string;
  timestamp: string;
  operation: string;
  channel: 'rest' | 'mcp';
  status: 'success' | 'error' | 'pending';
  duration_ms: number;
  parameters: Record<string, any>;
  result_summary?: string;
  error?: string;
}

export interface RateLimitData {
  resources: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    search?: {
      limit: number;
      remaining: number;
      reset: number;
    };
  };
}

export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  github_connected: boolean;
  authenticated_user?: string | null;
}
