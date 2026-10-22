/**
 * REST API client for communicating with the FastAPI MCP Server
 */
import {
  Branch,
  CommitItem,
  ContentItem,
  GitHubUser,
  HealthStatus,
  Issue,
  OperationLog,
  PullRequest,
  RateLimitData,
  Repository,
  Workflow,
  WorkflowRun,
  WorkflowRunLogs,
} from '../types/github';

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getBaseUrl(): string {
  const custom = localStorage.getItem('backend_api_url');
  if (custom) return custom.replace(/\/$/, '');
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return 'http://localhost:8000';
}

export function setBaseUrl(url: string) {
  if (url) {
    localStorage.setItem('backend_api_url', url.replace(/\/$/, ''));
  } else {
    localStorage.removeItem('backend_api_url');
  }
}

export function getStoredToken(): string {
  return localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || '';
}

export function setStoredToken(token: string) {
  if (token) {
    localStorage.setItem('github_token', token.trim());
  } else {
    localStorage.removeItem('github_token');
  }
}

export function getStoredApiKey(): string {
  return localStorage.getItem('backend_api_key') || '';
}

export function setStoredApiKey(key: string) {
  if (key) {
    localStorage.setItem('backend_api_key', key.trim());
  } else {
    localStorage.removeItem('backend_api_key');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getStoredToken();
  if (token) {
    headers['X-GitHub-Token'] = token;
  }

  const apiKey = getStoredApiKey();
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Request failed (${response.status})`;
    let details: any = null;
    try {
      const errJson = await response.json();
      errMsg = errJson.detail || errJson.message || errMsg;
      details = errJson.details || errJson;
    } catch {
      errMsg = await response.text();
    }
    throw new ApiError(errMsg, response.status, details);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// System & Auth
// ---------------------------------------------------------------------------

export async function fetchHealth(): Promise<HealthStatus> {
  return request<HealthStatus>('/health');
}

export async function fetchAuthStatus(): Promise<{
  authenticated: boolean;
  user: GitHubUser | null;
  message?: string;
  error?: string;
}> {
  return request('/api/auth/status');
}

export async function fetchRateLimit(): Promise<RateLimitData> {
  return request<RateLimitData>('/api/auth/ratelimit');
}

export async function fetchMcpInfo(): Promise<any> {
  return request('/api/mcp/info');
}

// ---------------------------------------------------------------------------
// Audit Operations
// ---------------------------------------------------------------------------

export async function fetchOperations(params?: {
  limit?: number;
  channel?: string;
  status?: string;
}): Promise<OperationLog[]> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.channel) qs.set('channel', params.channel);
  if (params?.status) qs.set('status', params.status);
  const qStr = qs.toString() ? `?${qs.toString()}` : '';
  return request<OperationLog[]>(`/api/operations${qStr}`);
}

export async function clearOperations(): Promise<{ success: boolean }> {
  return request('/api/operations', { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Repositories
// ---------------------------------------------------------------------------

export async function fetchRepositories(params?: {
  visibility?: 'all' | 'public' | 'private';
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}): Promise<Repository[]> {
  const qs = new URLSearchParams();
  if (params?.visibility) qs.set('visibility', params.visibility);
  if (params?.sort) qs.set('sort', params.sort);
  if (params?.direction) qs.set('direction', params.direction);
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  if (params?.page) qs.set('page', String(params.page));
  const qStr = qs.toString() ? `?${qs.toString()}` : '';
  return request<Repository[]>(`/api/repos${qStr}`);
}

export async function createRepository(data: {
  name: string;
  description?: string;
  private: boolean;
  auto_init?: boolean;
}): Promise<Repository> {
  return request<Repository>('/api/repos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchRepository(owner: string, repo: string): Promise<Repository> {
  return request<Repository>(`/api/repos/${owner}/${repo}`);
}

export async function updateRepository(
  owner: string,
  repo: string,
  data: { name?: string; description?: string; private?: boolean }
): Promise<Repository> {
  return request<Repository>(`/api/repos/${owner}/${repo}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteRepository(owner: string, repo: string, confirmName: string): Promise<any> {
  return request(`/api/repos/${owner}/${repo}?confirm=${encodeURIComponent(confirmName)}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

export async function fetchBranches(
  owner: string,
  repo: string,
  params?: { per_page?: number; page?: number }
): Promise<Branch[]> {
  const qs = new URLSearchParams();
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  if (params?.page) qs.set('page', String(params.page));
  const qStr = qs.toString() ? `?${qs.toString()}` : '';
  return request<Branch[]>(`/api/repos/${owner}/${repo}/branches${qStr}`);
}

export async function createBranch(
  owner: string,
  repo: string,
  data: { branch: string; from_branch?: string }
): Promise<any> {
  return request(`/api/repos/${owner}/${repo}/branches`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Pull Requests
// ---------------------------------------------------------------------------

export async function fetchPullRequests(
  owner: string,
  repo: string,
  params?: {
    state?: 'open' | 'closed' | 'all';
    sort?: 'created' | 'updated' | 'popularity' | 'long-running';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }
): Promise<PullRequest[]> {
  const qs = new URLSearchParams();
  if (params?.state) qs.set('state', params.state);
  if (params?.sort) qs.set('sort', params.sort);
  if (params?.direction) qs.set('direction', params.direction);
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  if (params?.page) qs.set('page', String(params.page));
  const qStr = qs.toString() ? `?${qs.toString()}` : '';
  return request<PullRequest[]>(`/api/repos/${owner}/${repo}/pulls${qStr}`);
}

export async function createPullRequest(
  owner: string,
  repo: string,
  data: {
    title: string;
    head: string;
    base: string;
    body?: string;
    draft?: boolean;
  }
): Promise<PullRequest> {
  return request<PullRequest>(`/api/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchPullRequest(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PullRequest> {
  return request<PullRequest>(`/api/repos/${owner}/${repo}/pulls/${pullNumber}`);
}

export async function reviewPullRequest(
  owner: string,
  repo: string,
  pullNumber: number,
  data: {
    event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
    body: string;
  }
): Promise<any> {
  return request(`/api/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function mergePullRequest(
  owner: string,
  repo: string,
  pullNumber: number,
  data: {
    commit_title?: string;
    commit_message?: string;
    merge_method: 'merge' | 'squash' | 'rebase';
  }
): Promise<any> {
  return request(`/api/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

export async function fetchIssues(
  owner: string,
  repo: string,
  params?: {
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }
): Promise<Issue[]> {
  const qs = new URLSearchParams();
  if (params?.state) qs.set('state', params.state);
  if (params?.labels) qs.set('labels', params.labels);
  if (params?.sort) qs.set('sort', params.sort);
  if (params?.direction) qs.set('direction', params.direction);
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  if (params?.page) qs.set('page', String(params.page));
  const qStr = qs.toString() ? `?${qs.toString()}` : '';
  return request<Issue[]>(`/api/repos/${owner}/${repo}/issues${qStr}`);
}

export async function createIssue(
  owner: string,
  repo: string,
  data: {
    title: string;
    body?: string;
    assignees?: string[];
    labels?: string[];
  }
): Promise<Issue> {
  return request<Issue>(`/api/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchIssue(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<Issue> {
  return request<Issue>(`/api/repos/${owner}/${repo}/issues/${issueNumber}`);
}

export async function updateIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  data: {
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    assignees?: string[];
    labels?: string[];
  }
): Promise<Issue> {
  return request<Issue>(`/api/repos/${owner}/${repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function closeIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  comment?: string
): Promise<Issue> {
  return request<Issue>(`/api/repos/${owner}/${repo}/issues/${issueNumber}/close`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

// ---------------------------------------------------------------------------
// Commits
// ---------------------------------------------------------------------------

export async function fetchCommits(
  owner: string,
  repo: string,
  params?: {
    sha?: string;
    path?: string;
    author?: string;
    per_page?: number;
    page?: number;
  }
): Promise<CommitItem[]> {
  const qs = new URLSearchParams();
  if (params?.sha) qs.set('sha', params.sha);
  if (params?.path) qs.set('path', params.path);
  if (params?.author) qs.set('author', params.author);
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  if (params?.page) qs.set('page', String(params.page));
  const qStr = qs.toString() ? `?${qs.toString()}` : '';
  return request<CommitItem[]>(`/api/repos/${owner}/${repo}/commits${qStr}`);
}

export async function fetchCommit(
  owner: string,
  repo: string,
  sha: string
): Promise<CommitItem> {
  return request<CommitItem>(`/api/repos/${owner}/${repo}/commits/${sha}`);
}

// ---------------------------------------------------------------------------
// Files & Contents
// ---------------------------------------------------------------------------

export async function fetchContents(
  owner: string,
  repo: string,
  path: string = '',
  ref?: string
): Promise<ContentItem | ContentItem[]> {
  const qs = new URLSearchParams();
  if (ref) qs.set('ref', ref);
  const qStr = qs.toString() ? `?${qs.toString()}` : '';
  const cleanPath = path ? `/${path.replace(/^\//, '')}` : '';
  return request<ContentItem | ContentItem[]>(`/api/repos/${owner}/${repo}/contents${cleanPath}${qStr}`);
}

export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  data: {
    message: string;
    content: string;
    sha?: string;
    branch?: string;
    is_base64?: boolean;
  }
): Promise<any> {
  const cleanPath = path.replace(/^\//, '');
  return request(`/api/repos/${owner}/${repo}/contents/${cleanPath}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export async function fetchWorkflows(
  owner: string,
  repo: string
): Promise<{ total_count: number; workflows: Workflow[] }> {
  return request(`/api/repos/${owner}/${repo}/actions/workflows`);
}

export async function fetchWorkflowRuns(
  owner: string,
  repo: string,
  params?: {
    workflow_id?: string;
    status?: string;
    per_page?: number;
    page?: number;
  }
): Promise<{ total_count: number; workflow_runs: WorkflowRun[] }> {
  const qs = new URLSearchParams();
  if (params?.workflow_id) qs.set('workflow_id', params.workflow_id);
  if (params?.status) qs.set('status', params.status);
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  if (params?.page) qs.set('page', String(params.page));
  const qStr = qs.toString() ? `?${qs.toString()}` : '';
  return request(`/api/repos/${owner}/${repo}/actions/runs${qStr}`);
}

export async function fetchWorkflowRunLogs(
  owner: string,
  repo: string,
  runId: number
): Promise<WorkflowRunLogs> {
  return request<WorkflowRunLogs>(`/api/repos/${owner}/${repo}/actions/runs/${runId}/logs`);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function searchGitHub(params: {
  query: string;
  type?: 'repositories' | 'issues' | 'pullrequests' | 'commits' | 'code' | 'users';
  per_page?: number;
  page?: number;
}): Promise<any> {
  const qs = new URLSearchParams();
  qs.set('q', params.query);
  if (params.type) qs.set('type', params.type);
  if (params.per_page) qs.set('per_page', String(params.per_page));
  if (params.page) qs.set('page', String(params.page));
  return request(`/api/search?${qs.toString()}`);
}
