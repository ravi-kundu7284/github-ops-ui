import React, { useState, useEffect, useCallback } from 'react';
import {
  CircleDot,
  ExternalLink,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { fetchIssues } from '../api/client';
import { useActiveRepo } from '../context/ActiveRepoContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CloseIssueModal } from '../components/modals/CloseIssueModal';
import { CreateIssueModal } from '../components/modals/CreateIssueModal';
import { Issue } from '../types/github';

export const IssuesView: React.FC = () => {
  const { activeOwner, activeRepoName } = useActiveRepo();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stateFilter, setStateFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState<Issue | null>(null);

  const loadIssues = useCallback(async () => {
    if (!activeOwner || !activeRepoName) return;
    setIsLoading(true);
    try {
      const data = await fetchIssues(activeOwner, activeRepoName, {
        state: stateFilter,
        per_page: 50,
      });
      setIssues(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  }, [activeOwner, activeRepoName, stateFilter]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const filtered = issues.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    String(i.number).includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <CircleDot className="w-5 h-5 text-amber-400" />
            Issue Management ({issues.length})
          </h1>
          <p className="text-xs text-[#8b949e] mt-1 font-mono">
            {activeOwner}/{activeRepoName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadIssues}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            New Issue
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#2f81f7]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['open', 'closed', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStateFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                stateFilter === s
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#8b949e]">
            {isLoading ? 'Loading issues...' : 'No issues found.'}
          </div>
        ) : (
          filtered.map((issue) => {
            const isOpen = issue.state === 'open';
            return (
              <div
                key={issue.number}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#21262d]/40 transition-colors"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-[#8b949e]">#{issue.number}</span>
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-sm text-[#f0f6fc] hover:text-[#2f81f7] transition-colors"
                    >
                      {issue.title}
                    </a>

                    <Badge variant={isOpen ? 'success' : 'purple'} size="sm">
                      {isOpen ? 'Open' : 'Closed'}
                    </Badge>

                    {issue.labels.map((lbl) => (
                      <span
                        key={lbl.id}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `#${lbl.color}20`,
                          color: `#${lbl.color}`,
                          borderColor: `#${lbl.color}50`,
                        }}
                      >
                        {lbl.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#8b949e] flex-wrap">
                    <span>opened by <strong className="text-slate-300 font-mono">{issue.user.login}</strong></span>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    {issue.comments > 0 && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <MessageSquare className="w-3 h-3" />
                        {issue.comments}
                      </span>
                    )}
                    {issue.assignees.length > 0 && (
                      <span>
                        Assigned to:{' '}
                        <strong className="text-slate-300 font-mono">
                          {issue.assignees.map((a) => a.login).join(', ')}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOpen && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<XCircle className="w-3.5 h-3.5 text-red-400" />}
                      onClick={() => setCloseTarget(issue)}
                    >
                      Close Issue
                    </Button>
                  )}

                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateIssueModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadIssues}
      />

      {closeTarget && (
        <CloseIssueModal
          isOpen={Boolean(closeTarget)}
          onClose={() => setCloseTarget(null)}
          onClosed={loadIssues}
          issueNumber={closeTarget.number}
          issueTitle={closeTarget.title}
        />
      )}
    </div>
  );
};
