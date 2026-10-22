import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  GitMerge,
  GitPullRequest,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { fetchBranches, fetchPullRequests } from '../api/client';
import { useActiveRepo } from '../context/ActiveRepoContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CreatePRModal } from '../components/modals/CreatePRModal';
import { MergePRModal } from '../components/modals/MergePRModal';
import { ReviewPRModal } from '../components/modals/ReviewPRModal';
import { Branch, PullRequest } from '../types/github';

export const PullRequestsView: React.FC = () => {
  const { activeOwner, activeRepoName } = useActiveRepo();
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stateFilter, setStateFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reviewPr, setReviewPr] = useState<PullRequest | null>(null);
  const [mergePr, setMergePr] = useState<PullRequest | null>(null);

  const loadData = useCallback(async () => {
    if (!activeOwner || !activeRepoName) return;
    setIsLoading(true);
    try {
      const [prsData, branchesData] = await Promise.all([
        fetchPullRequests(activeOwner, activeRepoName, { state: stateFilter, per_page: 50 }),
        fetchBranches(activeOwner, activeRepoName, { per_page: 50 }),
      ]);
      setPrs(prsData);
      setBranches(branchesData);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  }, [activeOwner, activeRepoName, stateFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = prs.filter((pr) =>
    pr.title.toLowerCase().includes(search.toLowerCase()) ||
    String(pr.number).includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-purple-400" />
            Pull Requests ({prs.length})
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
            onClick={loadData}
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
            New Pull Request
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search pull requests..."
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

      {/* PRs List */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#8b949e]">
            {isLoading ? 'Loading pull requests...' : 'No pull requests found.'}
          </div>
        ) : (
          filtered.map((pr) => {
            const isMerged = Boolean(pr.merged_at);
            const isClosed = pr.state === 'closed' && !isMerged;

            return (
              <div
                key={pr.number}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#21262d]/40 transition-colors"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-[#8b949e]">#{pr.number}</span>
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-sm text-[#f0f6fc] hover:text-[#2f81f7] transition-colors"
                    >
                      {pr.title}
                    </a>

                    {pr.state === 'open' && (
                      <Badge variant="success" size="sm" icon={<GitPullRequest className="w-3 h-3" />}>
                        Open
                      </Badge>
                    )}
                    {isMerged && (
                      <Badge variant="purple" size="sm" icon={<GitMerge className="w-3 h-3" />}>
                        Merged
                      </Badge>
                    )}
                    {isClosed && (
                      <Badge variant="danger" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                        Closed
                      </Badge>
                    )}
                    {pr.draft && (
                      <Badge variant="outline" size="sm">
                        Draft
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#8b949e] flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      {pr.head.ref} <span className="text-[#8b949e]">&rarr;</span> {pr.base.ref}
                    </span>
                    <span>by <strong className="text-slate-300 font-mono">{pr.user.login}</strong></span>
                    <span>opened {new Date(pr.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {pr.state === 'open' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<MessageSquare className="w-3.5 h-3.5" />}
                        onClick={() => setReviewPr(pr)}
                      >
                        Review
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<GitMerge className="w-3.5 h-3.5" />}
                        onClick={() => setMergePr(pr)}
                      >
                        Merge
                      </Button>
                    </>
                  )}

                  <a
                    href={pr.html_url}
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

      <CreatePRModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadData}
        branches={branches}
      />

      {reviewPr && (
        <ReviewPRModal
          isOpen={Boolean(reviewPr)}
          onClose={() => setReviewPr(null)}
          onReviewed={loadData}
          pullNumber={reviewPr.number}
          prTitle={reviewPr.title}
        />
      )}

      {mergePr && (
        <MergePRModal
          isOpen={Boolean(mergePr)}
          onClose={() => setMergePr(null)}
          onMerged={loadData}
          pullNumber={mergePr.number}
          prTitle={mergePr.title}
        />
      )}
    </div>
  );
};
