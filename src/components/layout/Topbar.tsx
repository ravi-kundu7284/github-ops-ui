import React from 'react';
import {
  Activity,
  ExternalLink,
  FolderGit2,
  RefreshCw,
  Search,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveRepo } from '../../context/ActiveRepoContext';

interface TopbarProps {
  onOpenSearch: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenSearch }) => {
  const { user, rateLimit, refreshAuth, isLoading } = useAuth();
  const { activeRepo, repositories, selectRepoByFullName } = useActiveRepo();

  const coreLimit = rateLimit?.resources?.core;

  return (
    <header className="h-14 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Active Repo Quick Selector */}
      <div className="flex items-center gap-2 max-w-sm w-full">
        <FolderGit2 className="w-4 h-4 text-[#8b949e] shrink-0" />
        <select
          value={activeRepo?.full_name || ''}
          onChange={(e) => selectRepoByFullName(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1 text-xs text-[#c9d1d9] font-mono focus:outline-none focus:border-[#2f81f7] w-full truncate"
        >
          <option value="">-- Switch Repository --</option>
          {repositories.map((repo) => (
            <option key={repo.full_name} value={repo.full_name}>
              {repo.full_name} {repo.private ? '(private)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Middle: Search input trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#8b949e] hover:border-[#8b949e] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search repositories, issues, PRs, commits...</span>
          </span>
          <kbd className="bg-[#21262d] px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#30363d] text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right items: Rate limit, Refresh, User profile */}
      <div className="flex items-center gap-3">
        {/* Rate limit badge */}
        {coreLimit && (
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#0d1117] border border-[#30363d] font-mono text-[#8b949e]"
            title={`Reset timestamp: ${new Date(coreLimit.reset * 1000).toLocaleTimeString()}`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>
              <strong className="text-white">{coreLimit.remaining}</strong>
              <span className="text-[#484f58]">/{coreLimit.limit}</span>
            </span>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={() => refreshAuth()}
          disabled={isLoading}
          className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {/* User profile */}
        {user ? (
          <a
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 pl-2 border-l border-[#30363d] hover:opacity-85 transition-opacity"
          >
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-7 h-7 rounded-full border border-[#30363d]"
            />
            <span className="text-xs font-medium text-[#f0f6fc] hidden sm:inline font-mono">
              {user.login}
            </span>
            <ExternalLink className="w-3 h-3 text-[#8b949e]" />
          </a>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#8b949e]">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Guest</span>
          </div>
        )}
      </div>
    </header>
  );
};
