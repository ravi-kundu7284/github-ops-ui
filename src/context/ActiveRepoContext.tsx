import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchRepositories, fetchRepository } from '../api/client';
import { Repository } from '../types/github';
import { useAuth } from './AuthContext';

interface ActiveRepoContextValue {
  activeRepo: Repository | null;
  activeOwner: string;
  activeRepoName: string;
  repositories: Repository[];
  isLoadingRepos: boolean;
  setActiveRepo: (repo: Repository | null) => void;
  selectRepoByFullName: (fullName: string) => Promise<void>;
  reloadRepositories: () => Promise<void>;
}

const ActiveRepoContext = createContext<ActiveRepoContextValue | undefined>(undefined);

export const ActiveRepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [activeRepo, setActiveRepo] = useState<Repository | null>(null);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);

  const reloadRepositories = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingRepos(true);
    try {
      const repos = await fetchRepositories({ per_page: 100 });
      setRepositories(repos);
      // If no active repo is set, default to the first repository or restore from localStorage
      const savedFullName = localStorage.getItem('last_active_repo');
      if (savedFullName) {
        const found = repos.find((r) => r.full_name === savedFullName);
        if (found) {
          setActiveRepo(found);
          return;
        }
      }
      if (repos.length > 0 && !activeRepo) {
        setActiveRepo(repos[0]);
      }
    } catch {
      // Silently fail or handled by views
    } finally {
      setIsLoadingRepos(false);
    }
  }, [isAuthenticated, activeRepo]);

  useEffect(() => {
    reloadRepositories();
  }, [isAuthenticated, reloadRepositories]);

  const selectRepoByFullName = async (fullName: string) => {
    if (!fullName) {
      setActiveRepo(null);
      localStorage.removeItem('last_active_repo');
      return;
    }

    localStorage.setItem('last_active_repo', fullName);
    const existing = repositories.find((r) => r.full_name === fullName);
    if (existing) {
      setActiveRepo(existing);
      return;
    }

    const [owner, name] = fullName.split('/');
    if (owner && name) {
      try {
        const full = await fetchRepository(owner, name);
        setActiveRepo(full);
      } catch {
        // Fallback placeholder
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

export const useActiveRepo = () => {
  const context = useContext(ActiveRepoContext);
  if (!context) {
    throw new Error('useActiveRepo must be used within an ActiveRepoProvider');
  }
  return context;
};
