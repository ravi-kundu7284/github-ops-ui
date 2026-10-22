import React, { useState } from 'react';
import {
  CircleDot,
  Code2,
  ExternalLink,
  FolderGit2,
  GitCommit,
  GitPullRequest,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { searchGitHub } from '../api/client';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<
    'repositories' | 'issues' | 'pullrequests' | 'commits' | 'code' | 'users'
  >('repositories');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const data = await searchGitHub({
        query: query.trim(),
        type: searchType,
        per_page: 30,
      });
      setResults(data);
    } catch {
      setResults({ total_count: 0, items: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const types = [
    { id: 'repositories', label: 'Repositories', icon: <FolderGit2 className="w-3.5 h-3.5" /> },
    { id: 'issues', label: 'Issues', icon: <CircleDot className="w-3.5 h-3.5" /> },
    { id: 'pullrequests', label: 'Pull Requests', icon: <GitPullRequest className="w-3.5 h-3.5" /> },
    { id: 'commits', label: 'Commits', icon: <GitCommit className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'Code', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
          <Search className="w-5 h-5 text-sky-400" />
          Global GitHub Search
        </h1>
        <p className="text-xs text-[#8b949e] mt-1">
          Search repositories, code, issues, PRs, and users with GitHub search qualifiers.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search across GitHub... (e.g. react stars:>1000 or author:octocat)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7]"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!query.trim()}
            className="px-6"
          >
            Search
          </Button>
        </div>

        {/* Search Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSearchType(t.id);
                if (query.trim()) {
                  setTimeout(() => handleSearch(), 50);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                searchType === t.id
                  ? 'bg-[#2f81f7] text-white shadow-sm'
                  : 'bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </form>

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8b949e]">
          <span>
            {results ? (
              <>
                Found <strong className="text-white">{results.total_count || 0}</strong> results
              </>
            ) : (
              'Enter a keyword and press Search'
            )}
          </span>
        </div>

        {results && results.items && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
            {results.items.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#8b949e]">
                No items found matching "{query}".
              </div>
            ) : (
              results.items.map((item: any, idx: number) => {
                return (
                  <div key={item.id || item.sha || idx} className="p-4 hover:bg-[#21262d]/40 transition-colors">
                    {searchType === 'repositories' && (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={item.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-sm text-sky-400 hover:underline"
                            >
                              {item.full_name}
                            </a>
                            <Badge variant={item.private ? 'warning' : 'outline'} size="sm">
                              {item.private ? 'Private' : 'Public'}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-xs text-[#8b949e]">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-[#8b949e] pt-1">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400" />
                              {item.stargazers_count}
                            </span>
                            <span>{item.language || 'Code'}</span>
                            <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <a href={item.html_url} target="_blank" rel="noreferrer" className="text-[#8b949e] hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {(searchType === 'issues' || searchType === 'pullrequests') && (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#8b949e]">#{item.number}</span>
                            <a
                              href={item.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-sm text-[#f0f6fc] hover:text-[#2f81f7]"
                            >
                              {item.title}
                            </a>
                            <Badge variant={item.state === 'open' ? 'success' : 'purple'} size="sm">
                              {item.state}
                            </Badge>
                          </div>
                          <div className="text-xs text-[#8b949e]">
                            <span>by {item.user?.login}</span> &bull;{' '}
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <a href={item.html_url} target="_blank" rel="noreferrer" className="text-[#8b949e] hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {searchType === 'users' && (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={item.avatar_url} alt={item.login} className="w-8 h-8 rounded-full border border-[#30363d]" />
                          <div>
                            <a
                              href={item.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-sm text-[#f0f6fc] hover:text-sky-400"
                            >
                              {item.login}
                            </a>
                            <div className="text-xs text-[#8b949e]">{item.type}</div>
                          </div>
                        </div>
                        <a href={item.html_url} target="_blank" rel="noreferrer" className="text-[#8b949e] hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {searchType === 'commits' && (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <a
                            href={item.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sm text-[#f0f6fc] hover:text-sky-400 font-mono"
                          >
                            {item.commit?.message?.split('\n')[0]}
                          </a>
                          <div className="text-xs text-[#8b949e] flex items-center gap-2">
                            <span>Author: {item.commit?.author?.name}</span>
                            <span className="font-mono text-slate-300">[{item.sha?.substring(0, 7)}]</span>
                          </div>
                        </div>
                        <a href={item.html_url} target="_blank" rel="noreferrer" className="text-[#8b949e] hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {searchType === 'code' && (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 font-mono text-xs">
                          <a href={item.html_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-bold">
                            {item.path}
                          </a>
                          <div className="text-[#8b949e]">{item.repository?.full_name}</div>
                        </div>
                        <a href={item.html_url} target="_blank" rel="noreferrer" className="text-[#8b949e] hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
