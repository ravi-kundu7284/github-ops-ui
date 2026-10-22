import React, { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink,
  FileDiff,
  GitCommit,
  RefreshCw,
  Search,
} from 'lucide-react';
import { fetchCommit, fetchCommits } from '../api/client';
import { useActiveRepo } from '../context/ActiveRepoContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { CommitItem } from '../types/github';

export const CommitsView: React.FC = () => {
  const { activeOwner, activeRepoName } = useActiveRepo();
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Selected commit modal for diff inspection
  const [selectedCommit, setSelectedCommit] = useState<CommitItem | null>(null);

  const loadCommits = useCallback(async () => {
    if (!activeOwner || !activeRepoName) return;
    setIsLoading(true);
    try {
      const data = await fetchCommits(activeOwner, activeRepoName, { per_page: 50 });
      setCommits(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  }, [activeOwner, activeRepoName]);

  useEffect(() => {
    loadCommits();
  }, [loadCommits]);

  const inspectCommit = async (sha: string) => {
    try {
      const full = await fetchCommit(activeOwner, activeRepoName, sha);
      setSelectedCommit(full);
    } catch {
      // Handled
    }
  };

  const filtered = commits.filter((c) =>
    c.commit.message.toLowerCase().includes(search.toLowerCase()) ||
    c.sha.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-sky-400" />
            Commit History ({commits.length})
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
            onClick={loadCommits}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search commits by message or SHA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#2f81f7]"
          />
        </div>
      </div>

      {/* Commits List */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#8b949e]">
            {isLoading ? 'Loading commits...' : 'No commits found.'}
          </div>
        ) : (
          filtered.map((commit) => {
            const firstLine = commit.commit.message.split('\n')[0];
            const authorName = commit.commit.author.name;
            const authorDate = new Date(commit.commit.author.date).toLocaleString();

            return (
              <div
                key={commit.sha}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#21262d]/40 transition-colors"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => inspectCommit(commit.sha)}
                      className="font-semibold text-sm text-[#f0f6fc] hover:text-[#2f81f7] text-left truncate transition-colors"
                    >
                      {firstLine}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                    {commit.author?.avatar_url && (
                      <img
                        src={commit.author.avatar_url}
                        alt={authorName}
                        className="w-4 h-4 rounded-full border border-[#30363d]"
                      />
                    )}
                    <span>by <strong className="text-slate-300">{authorName}</strong></span>
                    <span>on {authorDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FileDiff className="w-3.5 h-3.5" />}
                    onClick={() => inspectCommit(commit.sha)}
                  >
                    View Diff
                  </Button>

                  <span className="font-mono text-xs text-[#8b949e] bg-[#0d1117] px-2.5 py-1 rounded border border-[#30363d]">
                    {commit.sha.substring(0, 7)}
                  </span>

                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] transition-colors"
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

      {/* Inspect Commit Modal */}
      {selectedCommit && (
        <Modal
          isOpen={Boolean(selectedCommit)}
          onClose={() => setSelectedCommit(null)}
          title={`Commit: ${selectedCommit.sha.substring(0, 7)}`}
          maxWidth="3xl"
          footer={
            <Button variant="secondary" onClick={() => setSelectedCommit(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
              <pre className="text-xs text-[#f0f6fc] font-mono whitespace-pre-wrap leading-relaxed">
                {selectedCommit.commit.message}
              </pre>
              <div className="mt-3 pt-2 border-t border-[#30363d] flex items-center justify-between text-xs text-[#8b949e]">
                <span>Author: <strong className="text-white">{selectedCommit.commit.author.name}</strong></span>
                <span>Date: {new Date(selectedCommit.commit.author.date).toLocaleString()}</span>
              </div>
            </div>

            {selectedCommit.stats && (
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-300">Total: {selectedCommit.stats.total} changes</span>
                <span className="text-emerald-400">+{selectedCommit.stats.additions} additions</span>
                <span className="text-red-400">-{selectedCommit.stats.deletions} deletions</span>
              </div>
            )}

            {selectedCommit.files && selectedCommit.files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
                  Changed Files ({selectedCommit.files.length})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedCommit.files.map((file) => (
                    <div key={file.filename} className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-sky-300 font-semibold">{file.filename}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">+{file.additions}</span>
                          <span className="text-red-400">-{file.deletions}</span>
                        </div>
                      </div>
                      {file.patch && (
                        <pre className="p-2 bg-[#010409] border border-[#30363d]/60 rounded text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
                          {file.patch}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
