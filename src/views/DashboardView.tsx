import React from 'react';
import {
  Activity,
  ArrowRight,
  CircleDot,
  ExternalLink,
  FolderGit2,
  GitBranch,
  GitPullRequest,
  History,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Server,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useActiveRepo } from '../context/ActiveRepoContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ViewType } from '../components/layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenCreateRepo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCreateRepo,
}) => {
  const { user, backendHealth, rateLimit, refreshAuth, isLoading } = useAuth();
  const { repositories, activeRepo, selectRepoByFullName } = useActiveRepo();

  const coreLimit = rateLimit?.resources?.core;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#161b22] via-[#161b22] to-[#1f2937] border border-[#30363d] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
              GitHub Operations Management
            </span>
            <Badge variant="purple" size="sm" icon={<Sparkles className="w-3 h-3" />}>
              MCP Enabled
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-[#f0f6fc]">
            {user ? `Welcome back, ${user.name || user.login}` : 'GitHub Operations Dashboard'}
          </h1>
          <p className="text-sm text-[#8b949e] max-w-2xl leading-relaxed">
            Manage your GitHub repositories, branches, pull requests, issues, commits, and actions workflows backed by the FastAPI &amp; Model Context Protocol server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onOpenCreateRepo}>
            New Repository
          </Button>
          <Button variant="secondary" icon={<Search className="w-4 h-4" />} onClick={() => onNavigate('search')}>
            Global Search
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Info */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-xs font-semibold uppercase tracking-wider">GitHub Account</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            {user ? (
              <>
                <img src={user.avatar_url} alt={user.login} className="w-10 h-10 rounded-full border border-[#30363d]" />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#f0f6fc] truncate">{user.name || user.login}</div>
                  <div className="text-xs text-[#8b949e] font-mono">@{user.login}</div>
                </div>
              </>
            ) : (
              <div className="text-xs text-amber-300">No token configured</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-[#30363d]/60 flex items-center justify-between text-xs text-[#8b949e]">
            <span>Public Repos: <strong className="text-[#f0f6fc]">{user?.public_repos ?? 0}</strong></span>
            <span>Followers: <strong className="text-[#f0f6fc]">{user?.followers ?? 0}</strong></span>
          </div>
        </div>

        {/* Backend & MCP Status */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-xs font-semibold uppercase tracking-wider">MCP Backend</span>
            <Server className="w-4 h-4" />
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${backendHealth?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-semibold text-[#f0f6fc]">
                {backendHealth?.status === 'ok' ? 'Server Online' : 'Connecting...'}
              </span>
            </div>
            <div className="text-xs text-[#8b949e] font-mono">
              Transports: /mcp (Streamable HTTP) &amp; /sse
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#30363d]/60 flex items-center justify-between text-xs text-[#8b949e]">
            <span>FastAPI: <strong className="text-[#f0f6fc]">Active</strong></span>
            <span>Tools: <strong className="text-emerald-400">22 Registered</strong></span>
          </div>
        </div>

        {/* GitHub API Rate Limits */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-xs font-semibold uppercase tracking-wider">GitHub API Quota</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[#f0f6fc]">
              {coreLimit ? coreLimit.remaining : '--'}
              <span className="text-xs font-normal text-[#8b949e] ml-1">
                / {coreLimit ? coreLimit.limit : '--'}
              </span>
            </div>
            <div className="w-full bg-[#0d1117] rounded-full h-1.5 mt-2 overflow-hidden border border-[#30363d]">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: coreLimit ? `${(coreLimit.remaining / coreLimit.limit) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#30363d]/60 flex items-center justify-between text-xs text-[#8b949e]">
            <span>Used: <strong className="text-[#f0f6fc]">{coreLimit?.used ?? 0}</strong></span>
            <button onClick={() => refreshAuth()} className="text-sky-400 hover:underline flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Active Repository Card */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Repository</span>
            <FolderGit2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            {activeRepo ? (
              <>
                <div className="text-sm font-bold text-sky-400 truncate font-mono">
                  {activeRepo.full_name}
                </div>
                <div className="text-xs text-[#8b949e] mt-1 flex items-center gap-2">
                  <GitBranch className="w-3 h-3" />
                  <span>{activeRepo.default_branch}</span>
                  {activeRepo.private && (
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Lock className="w-3 h-3" /> private
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-[#8b949e] italic">No repository selected</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-[#30363d]/60 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('branches')}
              className="text-[#2f81f7] hover:underline flex items-center gap-1 font-medium"
            >
              Manage Repository <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Repositories List & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Repositories table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#f0f6fc] flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-sky-400" />
              Repositories ({repositories.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('repositories')}>
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
            {repositories.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#8b949e]">
                No repositories loaded yet. Make sure your GitHub token is configured in Settings.
              </div>
            ) : (
              repositories.slice(0, 6).map((repo) => {
                const isSelected = activeRepo?.full_name === repo.full_name;
                return (
                  <div
                    key={repo.full_name}
                    className={`p-4 flex items-center justify-between gap-4 hover:bg-[#21262d]/50 transition-colors ${
                      isSelected ? 'bg-[#21262d]/80 border-l-2 border-l-[#2f81f7]' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectRepoByFullName(repo.full_name)}
                          className="font-semibold text-sm text-[#f0f6fc] hover:text-[#2f81f7] text-left truncate transition-colors"
                        >
                          {repo.full_name}
                        </button>
                        <Badge variant={repo.private ? 'warning' : 'outline'} size="sm">
                          {repo.private ? 'Private' : 'Public'}
                        </Badge>
                        {isSelected && (
                          <Badge variant="info" size="sm">
                            Active
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-[#8b949e] truncate max-w-lg">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[#8b949e] pt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <GitBranch className="w-3 h-3" />
                          {repo.default_branch}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <CircleDot className="w-3 h-3" />
                          {repo.open_issues_count} issues
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => selectRepoByFullName(repo.full_name)}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Quick Access & Operations Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#f0f6fc] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Quick Operations
          </h2>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
            <button
              onClick={() => onNavigate('branches')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-[#8b949e] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#f0f6fc]">Branch Operations</div>
                  <div className="text-[11px] text-[#8b949e]">Create &amp; inspect branch refs</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8b949e]" />
            </button>

            <button
              onClick={() => onNavigate('pulls')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-[#8b949e] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-950/50 border border-purple-800/40 text-purple-400 flex items-center justify-center">
                  <GitPullRequest className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#f0f6fc]">Pull Requests</div>
                  <div className="text-[11px] text-[#8b949e]">Create, review &amp; merge PRs</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8b949e]" />
            </button>

            <button
              onClick={() => onNavigate('issues')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-[#8b949e] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950/50 border border-amber-800/40 text-amber-400 flex items-center justify-center">
                  <CircleDot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#f0f6fc]">Issues Management</div>
                  <div className="text-[11px] text-[#8b949e]">Assign, label &amp; close issues</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8b949e]" />
            </button>

            <button
              onClick={() => onNavigate('audit')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-[#8b949e] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-950/50 border border-sky-800/40 text-sky-400 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#f0f6fc]">Audit Log History</div>
                  <div className="text-[11px] text-[#8b949e]">Inspect MCP &amp; REST telemetry</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8b949e]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
