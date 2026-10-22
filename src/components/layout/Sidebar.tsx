import React from 'react';
import {
  CircleDot,
  FileCode,
  FolderGit2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  History,
  LayoutDashboard,
  PlaySquare,
  Search,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActiveRepo } from '../../context/ActiveRepoContext';

export type ViewType =
  | 'dashboard'
  | 'repositories'
  | 'branches'
  | 'pulls'
  | 'issues'
  | 'commits'
  | 'files'
  | 'workflows'
  | 'search'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { backendHealth, isAuthenticated } = useAuth();
  const { activeRepo } = useActiveRepo();

  const navItems: Array<{ id: ViewType; label: string; icon: React.ReactNode; requiresRepo?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'repositories', label: 'Repositories', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'branches', label: 'Branches', icon: <GitBranch className="w-4 h-4" />, requiresRepo: true },
    { id: 'pulls', label: 'Pull Requests', icon: <GitPullRequest className="w-4 h-4" />, requiresRepo: true },
    { id: 'issues', label: 'Issues', icon: <CircleDot className="w-4 h-4" />, requiresRepo: true },
    { id: 'commits', label: 'Commits', icon: <GitCommit className="w-4 h-4" />, requiresRepo: true },
    { id: 'files', label: 'Files & Code', icon: <FileCode className="w-4 h-4" />, requiresRepo: true },
    { id: 'workflows', label: 'Actions / Workflows', icon: <PlaySquare className="w-4 h-4" />, requiresRepo: true },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Log', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & MCP', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#010409] border-r border-[#30363d] flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="h-14 border-b border-[#30363d] flex items-center px-4 gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#2f81f7]/10 border border-[#2f81f7]/30 flex items-center justify-center text-[#2f81f7]">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-sm tracking-tight text-[#f0f6fc]">GitHub Ops</span>
          <span className="text-[10px] block text-[#8b949e] font-mono leading-none">MCP Dashboard</span>
        </div>
      </div>

      {/* Active Repo Chip */}
      <div className="px-3 pt-3 pb-2 border-b border-[#30363d]/50 bg-[#0d1117]/40">
        <div className="text-[10px] uppercase font-semibold text-[#8b949e] tracking-wider mb-1 px-1">
          Active Repository
        </div>
        {activeRepo ? (
          <div className="px-2 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] flex items-center justify-between text-xs text-[#c9d1d9]">
            <span className="truncate font-mono font-medium text-sky-400">
              {activeRepo.name}
            </span>
            <span className="text-[10px] text-[#8b949e] shrink-0 ml-1">
              {activeRepo.private ? '🔒' : '🌐'}
            </span>
          </div>
        ) : (
          <div className="px-2 py-1 rounded text-xs text-[#8b949e] italic">
            No repository selected
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const isDisabled = item.requiresRepo && !activeRepo;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onNavigate(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : isDisabled
                  ? 'opacity-40 cursor-not-allowed text-[#8b949e]'
                  : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
              }`}
            >
              <span className={isActive ? 'text-[#2f81f7]' : 'text-slate-400'}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.requiresRepo && !activeRepo && (
                <span className="text-[9px] uppercase tracking-wider text-[#484f58]">repo</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#30363d] bg-[#0d1117]/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealth?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-[11px] text-[#8b949e]">Backend</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {backendHealth?.version ? `v${backendHealth.version}` : 'offline'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-[#8b949e]">GitHub Auth</span>
          </div>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              isAuthenticated
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
            }`}
          >
            {isAuthenticated ? 'Connected' : 'Missing Token'}
          </span>
        </div>
      </div>
    </aside>
  );
};
