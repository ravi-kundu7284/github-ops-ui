/**
 * Active Repository Context.
 *
 * This context manages the currently active repository context across all sub-views
 * (Branches, Pull Requests, Issues, Commits, Files, and Workflows). It persists the
 * user's last selected repository to `localStorage` and provides a global switcher.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchRepositories, fetchRepository } from '../api/client';
import { Repository } from '../types/github';
import { useAuth } from './AuthContext';

/**
 * Value exposed to consumers of ActiveRepoContext.
 */
interface ActiveRepoContextValue {
  /** The currently selected repository object (or null if none chosen) */
  activeRepo: Repository | null;
  /** Convenience shortcut: the owner username login (e.g. 'octocat') */
  activeOwner: string;
  /** Convenience shortcut: the repository name (e.g. 'my-repo') */
  activeRepoName: string;
  /** Complete list of repositories accessible to the user */
  repositories: Repository[];
  /** True while the repository list is being fetched from GitHub */
  isLoadingRepos: boolean;
  /** Set the active repository directly by object */
  setActiveRepo: (repo: Repository | null) => void;
  /** Select the active repository by full slug ('owner/repo') */
  selectRepoByFullName: (fullName: string) => Promise<void>;
  /** Re-fetch the repository list from the backend */
  reloadRepositories: () => Promise<void>;
}

const ActiveRepoContext = createContext<ActiveRepoContextValue | undefined>(undefined);

/**
 * Active Repository Context Provider.
 */
export const ActiveRepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [activeRepo, setActiveRepo] = useState<Repository | null>(null);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);

  /**
   * Fetch all user repositories from the backend REST API.
   * If a previous repository selection exists in localStorage, restore it automatically.
   */
  const reloadRepositories = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingRepos(true);
    try {
      const repos = await fetchRepositories({ per_page: 100 });
      setRepositories(repos);

      // Check if user previously selected a repository in this browser session
      const savedFullName = localStorage.getItem('last_active_repo');
      if (savedFullName) {
        const found = repos.find((r) => r.full_name === savedFullName);
        if (found) {
          setActiveRepo(found);
          return;
        }
      }

      // Default to the first repository in list if no active selection
      if (repos.length > 0 && !activeRepo) {
        setActiveRepo(repos[0]);
      }
    } catch {
      // Non-critical; errors surface in views if repository list fails to load
    } finally {
      setIsLoadingRepos(false);
    }
  }, [isAuthenticated, activeRepo]);

  // Re-fetch repositories whenever authentication status transitions to true
  useEffect(() => {
    reloadRepositories();
  }, [isAuthenticated, reloadRepositories]);

  /**
   * Switch active repository context by full name ('owner/name').
   * If the repository isn't in the initial 100 list, fetches individual repo metadata.
   */
  const selectRepoByFullName = async (fullName: string) => {
    if (!fullName) {
      setActiveRepo(null);
      localStorage.removeItem('last_active_repo');
      return;
    }

    localStorage.setItem('last_active_repo', fullName);

    // 1. Try finding in already fetched list
    const existing = repositories.find((r) => r.full_name === fullName);
    if (existing) {
      setActiveRepo(existing);
      return;
    }

    // 2. Fetch repo metadata directly from GitHub API
    const [owner, name] = fullName.split('/');
    if (owner && name) {
      try {
        const full = await fetchRepository(owner, name);
        setActiveRepo(full);
      } catch {
        // Fallback placeholder object if details fetch fails
        setActiveRepo({
          name,
          full_name: fullName,
          owner: { login: owner },
          private: false,
          html_url: `https://github.com/${fullName}`,
          description: null,
          fork: false,
          default_branch: 'main',
          stargazers_count: 0,
          forks_count: 0,
          open_issues_count: 0,
        });
      }
    }
  };

  const activeOwner = activeRepo?.owner?.login || '';
  const activeRepoName = activeRepo?.name || '';

  return (
    <ActiveRepoContext.Provider
      value={{
        activeRepo,
        activeOwner,
        activeRepoName,
        repositories,
        isLoadingRepos,
        setActiveRepo: (repo) => {
          setActiveRepo(repo);
          if (repo) localStorage.setItem('last_active_repo', repo.full_name);
        },
        selectRepoByFullName,
        reloadRepositories,
      }}
    >
      {children}
    </ActiveRepoContext.Provider>
  );
};

/**
 * Custom hook to access active repository context.
 */
export const useActiveRepo = () => {
  const context = useContext(ActiveRepoContext);
  if (!context) {
    throw new Error('useActiveRepo must be used within an ActiveRepoProvider');
  }
  return context;
};
