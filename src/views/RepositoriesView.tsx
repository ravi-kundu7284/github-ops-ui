import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  FolderGit2,
  GitBranch,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Trash2,
} from 'lucide-react';
import { deleteRepository, updateRepository } from '../api/client';
import { useActiveRepo } from '../context/ActiveRepoContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Input, Textarea } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Repository } from '../types/github';

interface RepositoriesViewProps {
  onOpenCreateRepo: () => void;
  onSelectRepo: (repo: Repository) => void;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({
  onOpenCreateRepo,
  onSelectRepo,
}) => {
  const { repositories, reloadRepositories, isLoadingRepos, activeRepo } = useActiveRepo();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'stars'>('updated');

  // Deletion modal state
  const [repoToDelete, setRepoToDelete] = useState<Repository | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit settings modal state
  const [repoToEdit, setRepoToEdit] = useState<Repository | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrivate, setEditPrivate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtered & sorted repos
  const filteredRepos = useMemo(() => {
    return repositories
      .filter((r) => {
        if (visibilityFilter === 'public' && r.private) return false;
        if (visibilityFilter === 'private' && !r.private) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = r.name.toLowerCase().includes(q) || r.full_name.toLowerCase().includes(q);
          const matchesDesc = r.description?.toLowerCase().includes(q);
          return matchesName || matchesDesc;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });
  }, [repositories, searchQuery, visibilityFilter, sortBy]);

  // Handle deletion
  const handleDeleteConfirm = async () => {
    if (!repoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRepository(repoToDelete.owner.login, repoToDelete.name, repoToDelete.name);
      success('Repository deleted', `Deleted ${repoToDelete.full_name}`);
      setRepoToDelete(null);
      await reloadRepositories();
    } catch (err: any) {
      error('Failed to delete repository', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit modal
  const handleOpenEdit = (repo: Repository) => {
    setRepoToEdit(repo);
    setEditName(repo.name);
    setEditDesc(repo.description || '');
    setEditPrivate(repo.private);
  };

  // Handle update
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoToEdit) return;
    setIsUpdating(true);
    try {
      await updateRepository(repoToEdit.owner.login, repoToEdit.name, {
        name: editName.trim() || undefined,
        description: editDesc.trim() || undefined,
        private: editPrivate,
      });
      success('Repository updated', `Updated ${repoToEdit.name}`);
      setRepoToEdit(null);
      await reloadRepositories();
    } catch (err: any) {
      error('Failed to update repository', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-sky-400" />
            Repository Management
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Browse, manage settings, create branches, or delete repositories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingRepos ? 'animate-spin' : ''}`} />}
            onClick={() => reloadRepositories()}
            disabled={isLoadingRepos}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={onOpenCreateRepo}>
            New Repository
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#161b22] border border-[#30363d] rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#2f81f7]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as any)}
            className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#2f81f7]"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#2f81f7]"
          >
            <option value="updated">Recently Updated</option>
            <option value="name">Alphabetical</option>
            <option value="stars">Most Stars</option>
          </select>
        </div>
      </div>

      {/* Repositories Table / Grid */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
        {filteredRepos.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#8b949e]">
            {searchQuery ? 'No repositories match your filter.' : 'No repositories found.'}
          </div>
        ) : (
          filteredRepos.map((repo) => {
            const isActive = activeRepo?.full_name === repo.full_name;
            return (
              <div
                key={repo.full_name}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#21262d]/40 transition-colors ${
                  isActive ? 'bg-[#21262d]/60 border-l-2 border-l-[#2f81f7]' : ''
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onSelectRepo(repo)}
                      className="font-bold text-sm text-[#f0f6fc] hover:text-[#2f81f7] transition-colors"
                    >
                      {repo.full_name}
                    </button>
                    <Badge variant={repo.private ? 'warning' : 'outline'} size="sm">
                      {repo.private ? (
                        <>
                          <Lock className="w-3 h-3 mr-0.5" /> Private
                        </>
                      ) : (
                        'Public'
                      )}
                    </Badge>
                    {isActive && (
                      <Badge variant="info" size="sm">
                        Active Context
                      </Badge>
                    )}
                  </div>

                  {repo.description && (
                    <p className="text-xs text-[#8b949e] leading-relaxed max-w-2xl">{repo.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[#8b949e] pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <GitBranch className="w-3 h-3 text-emerald-400" />
                      {repo.default_branch}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      {repo.stargazers_count}
                    </span>
                    <span>
                      Updated {repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <Button
                    variant={isActive ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => onSelectRepo(repo)}
                  >
                    {isActive ? 'Active' : 'Select'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Settings className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenEdit(repo)}
                    title="Settings"
                  >
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => setRepoToDelete(repo)}
                    title="Delete Repository"
                  >
                    Delete
                  </Button>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-colors"
                    title="Open in GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Delete Repository */}
      {repoToDelete && (
        <ConfirmModal
          isOpen={Boolean(repoToDelete)}
          onClose={() => setRepoToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title={`Delete Repository: ${repoToDelete.name}`}
          message={`This action cannot be undone. This will permanently delete the ${repoToDelete.full_name} repository, including all code, branches, issues, and pull requests.`}
          confirmLabel="Delete this repository"
          confirmVariant="danger"
          challengeText={repoToDelete.name}
          isLoading={isDeleting}
        />
      )}

      {/* Edit Settings Modal */}
      {repoToEdit && (
        <Modal
          isOpen={Boolean(repoToEdit)}
          onClose={() => setRepoToEdit(null)}
          title={`Repository Settings: ${repoToEdit.name}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setRepoToEdit(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateSubmit} isLoading={isUpdating}>
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
            <Input
              label="Repository Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <Textarea
              label="Description"
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />

            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-[#30363d]">
              <input
                type="checkbox"
                checked={editPrivate}
                onChange={(e) => setEditPrivate(e.target.checked)}
                className="mt-0.5 rounded border-[#30363d] bg-[#0d1117] text-[#2f81f7]"
              />
              <div>
                <span className="text-xs font-semibold text-[#f0f6fc]">Private Repository</span>
                <p className="text-xs text-[#8b949e]">Toggle private or public repository visibility.</p>
              </div>
            </label>
          </form>
        </Modal>
      )}
    </div>
  );
};

