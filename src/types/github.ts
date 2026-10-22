/**
 * GitHub Operations Management UI - Type Definitions
 *
 * This file contains strictly-typed TypeScript interfaces modeling all GitHub entities
 * (Users, Repositories, Branches, Pull Requests, Issues, Commits, Tree Contents, Workflows, Runs),
 * API client request payloads, diagnostic health metrics, and audit operation logs.
 */

/**
 * Authenticated GitHub user profile information.
 */
export interface GitHubUser {
  /** GitHub username handle (e.g. 'octocat') */
  login: string;
  /** Unique numeric GitHub user ID */
  id: number;
  /** Direct URL to user avatar image on GitHub avatar CDN */
  avatar_url: string;
  /** Full display name (e.g. 'The Octocat') */
  name?: string;
  /** User bio or description */
  bio?: string;
  /** Number of publicly accessible repositories owned */
  public_repos: number;
  /** Total private repositories accessible to this token */
  total_private_repos?: number;
  /** Number of followers */
  followers?: number;
  /** Number of users followed */
  following?: number;
  /** Direct link to the user profile on github.com */
  html_url: string;
}

/**
 * GitHub repository metadata and settings.
 */
export interface Repository {
  /** Repository ID */
  id?: number;
  /** Short repository name without owner (e.g. 'github-ops-ui') */
  name: string;
  /** Full qualified repository slug (e.g. 'owner/github-ops-ui') */
  full_name: string;
  /** Repository owner details */
  owner: {
    login: string;
    avatar_url?: string;
  };
  /** Whether the repository is private */
  private: boolean;
  /** Web URL on github.com */
  html_url: string;
  /** Repository description text or null */
  description: string | null;
  /** Whether this repository is a fork of another */
  fork: boolean;
  /** The primary default branch (usually 'main' or 'master') */
  default_branch: string;
  /** Total star count */
  stargazers_count: number;
  /** Total forks count */
  forks_count: number;
  /** Number of currently open issues and pull requests */
  open_issues_count: number;
  /** Topic tags associated with repository */
  topics?: string[];
  /** ISO date string when repository was created */
  created_at?: string;
  /** ISO date string when repository was last updated */
  updated_at?: string;
  /** ISO date string when code was last pushed */
  pushed_at?: string;
  /** Visibility mode: 'public' or 'private' */
  visibility?: string;
}

/**
 * Git Branch reference within a repository.
 */
export interface Branch {
  /** Branch name (e.g. 'main', 'feature/login') */
  name: string;
  /** Head commit object */
  commit: {
    sha: string;
    url?: string;
  };
  /** Whether branch protection rules are active */
  protected?: boolean;
}

/**
 * GitHub Pull Request entity.
 */
export interface PullRequest {
  id?: number;
  /** Sequential PR number (e.g. #42) */
  number: number;
  /** State: 'open' or 'closed' */
  state: 'open' | 'closed';
  /** Pull request title */
  title: string;
  /** Markdown description body or null */
  body: string | null;
  /** Web URL to view the PR on github.com */
  html_url: string;
  /** User who authored and opened the PR */
  user: {
    login: string;
    avatar_url: string;
  };
  /** ISO timestamp when opened */
  created_at: string;
  /** ISO timestamp of last update */
  updated_at: string;
  /** ISO timestamp when closed (if closed) */
  closed_at?: string | null;
  /** ISO timestamp when merged (if merged) */
  merged_at?: string | null;
  /** Head branch containing changes */
  head: {
    ref: string;
    sha: string;
  };
  /** Target base branch to merge into */
  base: {
    ref: string;
    sha: string;
  };
  /** Whether this pull request is a draft */
  draft?: boolean;
}

/**
 * GitHub Issue entity (excluding pull requests).
 */
export interface Issue {
  id?: number;
  /** Issue number (e.g. #10) */
  number: number;
  /** State: 'open' or 'closed' */
  state: 'open' | 'closed';
  /** Issue title headline */
  title: string;
  /** Markdown description body */
  body: string | null;
  /** Author who reported the issue */
  user: {
    login: string;
    avatar_url: string;
  };
  /** Attached label badges */
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description?: string;
  }>;
  /** Assigned GitHub users */
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  /** Total comment replies count */
  comments: number;
  /** ISO timestamp when created */
  created_at: string;
  /** ISO timestamp when last updated */
  updated_at: string;
  /** ISO timestamp when closed (if closed) */
  closed_at?: string | null;
  /** Web URL to view issue on github.com */
  html_url: string;
}

/**
 * Git Commit information with author and diff metrics.
 */
export interface CommitItem {
  /** Full 40-character commit SHA hash */
  sha: string;
  /** Git commit object details */
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
  /** Linked GitHub user profile if account is verified */
  author?: {
    login: string;
    avatar_url: string;
  } | null;
  /** Web URL to view commit on github.com */
  html_url: string;
  /** Line addition and deletion statistics */
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  /** Files modified in this specific commit */
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
}

/**
 * Directory entry or file content node in repository tree.
 */
export interface ContentItem {
  /** Item type: 'file', 'dir', 'symlink', or 'submodule' */
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  /** File or directory name */
  name: string;
  /** Relative path within repository */
  path: string;
  /** Git blob SHA hash */
  sha: string;
  /** File size in bytes */
  size: number;
  /** Web URL to view item on github.com */
  html_url?: string;
  /** Direct download URL */
  download_url?: string;
  /** Base64 encoding indicator */
  encoding?: string;
  /** Raw base64 content if file */
  content?: string;
  /** Decoded plain text UTF-8 content */
  decoded_content?: string;
}

/**
 * GitHub Actions workflow definition file in .github/workflows/.
 */
export interface Workflow {
  id: number;
  /** Workflow name (from name: field in YAML) */
  name: string;
  /** Path in repository (e.g. '.github/workflows/ci.yml') */
  path: string;
  /** Status: 'active' or 'disabled' */
  state: string;
  created_at?: string;
  updated_at?: string;
  html_url?: string;
}

/**
 * GitHub Actions execution run for a workflow.
 */
export interface WorkflowRun {
  id: number;
  /** Name of the workflow executed */
  name: string;
  /** Execution status ('completed', 'in_progress', 'queued') */
  status: 'completed' | 'in_progress' | 'queued' | 'waiting' | string;
  /** Final result ('success', 'failure', 'cancelled', 'neutral') */
  conclusion: 'success' | 'failure' | 'cancelled' | 'neutral' | 'skipped' | null | string;
  workflow_id: number;
  html_url: string;
  /** Triggering event ('push', 'pull_request', 'workflow_dispatch') */
  event: string;
  /** Branch where run was triggered */
  head_branch: string;
  /** Commit SHA on which run was executed */
  head_sha: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  actor?: {
    login: string;
    avatar_url: string;
  };
}

/**
 * Workflow execution logs and individual job steps.
 */
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

/**
 * Audit log entry recording an executed REST or MCP operation.
 */
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

/**
 * GitHub API rate limit response data.
 */
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

/**
 * Service health status report from backend /health endpoint.
 */
export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  github_connected: boolean;
  authenticated_user?: string | null;
}
