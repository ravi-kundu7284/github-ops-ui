import React, { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink,
  GitBranch,
  Plus,
  RefreshCw,
  Search,
  Shield,
} from 'lucide-react';
import { fetchBranches } from '../api/client';
import { useActiveRepo } from '../context/ActiveRepoContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CreateBranchModal } from '../components/modals/CreateBranchModal';
import { Branch } from '../types/github';

export const BranchesView: React.FC = () => {
  const { activeOwner, activeRepoName, activeRepo } = useActiveRepo();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadBranches = useCallback(async () => {
    if (!activeOwner || !activeRepoName) return;
    setIsLoading(true);
    try {
      const data = await fetchBranches(activeOwner, activeRepoName, { per_page: 100 });
      setBranches(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  }, [activeOwner, activeRepoName]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            Branches ({branches.length})
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
            onClick={loadBranches}
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
            New Branch
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search branches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#2f81f7]"
          />
        </div>
      </div>

      {/* Branches List */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#8b949e]">
            {isLoading ? 'Loading branches...' : 'No branches found.'}
          </div>
        ) : (
          filtered.map((branch) => {
            const isDefault = branch.name === activeRepo?.default_branch;
            return (
              <div
                key={branch.name}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#21262d]/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GitBranch className="w-4 h-4 text-[#8b949e] shrink-0" />
                  <span className="font-mono text-sm font-semibold text-[#f0f6fc] truncate">
                    {branch.name}
                  </span>
                  {isDefault && (
                    <Badge variant="info" size="sm">
                      Default
                    </Badge>
                  )}
                  {branch.protected && (
                    <Badge variant="purple" size="sm" icon={<Shield className="w-3 h-3" />}>
                      Protected
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-[#8b949e] bg-[#0d1117] px-2 py-1 rounded border border-[#30363d]">
                    {branch.commit.sha.substring(0, 7)}
                  </span>
                  <a
                    href={`https://github.com/${activeOwner}/${activeRepoName}/tree/${branch.name}`}
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

      <CreateBranchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadBranches}
      />
    </div>
  );
};
