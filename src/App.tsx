/**
 * Main Application Component (`App.tsx`).
 *
 * Coordinates global state providers, layout shell, modal controllers, and view-level
 * client-side routing between:
 * - Dashboard (account overview & quick actions)
 * - Repositories (list, settings, create, delete)
 * - Branches (list & creation)
 * - Pull Requests (list, create, review, merge)
 * - Issues (list, create, close)
 * - Commits (history & diff inspection)
 * - Files & Code (file tree & in-browser editor)
 * - Actions / Workflows (CI/CD execution & log inspect)
 * - Search (global GitHub search with Ctrl+K)
 * - Audit Log (real-time operation telemetry)
 * - Settings & MCP (tokens, backend URLs, MCP snippets)
 */
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ActiveRepoProvider, useActiveRepo } from './context/ActiveRepoContext';
import { Layout } from './components/layout/Layout';
import { ViewType } from './components/layout/Sidebar';
import { CreateRepoModal } from './components/modals/CreateRepoModal';

// Views
import { DashboardView } from './views/DashboardView';
import { RepositoriesView } from './views/RepositoriesView';
import { BranchesView } from './views/BranchesView';
import { PullRequestsView } from './views/PullRequestsView';
import { IssuesView } from './views/IssuesView';
import { CommitsView } from './views/CommitsView';
import { FilesView } from './views/FilesView';
import { WorkflowsView } from './views/WorkflowsView';
import { SearchView } from './views/SearchView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';

/**
 * Inner Application Content Component.
 * Consumes ActiveRepoContext and controls view switching.
 */
const AppContent: React.FC = () => {
  // Current active navigation tab / view
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  // Global repository creation dialog state
  const [isCreateRepoOpen, setIsCreateRepoOpen] = useState(false);

  // Active repository selector hooks
  const { selectRepoByFullName, reloadRepositories } = useActiveRepo();

  /**
   * Called when a user clicks "Select" on a repository in the Repositories table.
   * Switches active context to that repository and navigates to the Branches tab.
   */
  const handleSelectRepo = (repo: any) => {
    selectRepoByFullName(repo.full_name);
    setCurrentView('branches');
  };

  /**
   * Called after a new repository is successfully created via the CreateRepoModal.
   * Reloads the repository list and selects the newly created repository.
   */
  const handleRepoCreated = async (fullName: string) => {
    await reloadRepositories();
    await selectRepoByFullName(fullName);
    setCurrentView('repositories');
  };

  /**
   * Render view component based on currentView navigation state.
   */
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setCurrentView}
            onOpenCreateRepo={() => setIsCreateRepoOpen(true)}
          />
        );
      case 'repositories':
        return (
          <RepositoriesView
            onOpenCreateRepo={() => setIsCreateRepoOpen(true)}
            onSelectRepo={handleSelectRepo}
          />
        );
      case 'branches':
        return <BranchesView />;
      case 'pulls':
        return <PullRequestsView />;
      case 'issues':
        return <IssuesView />;
      case 'commits':
        return <CommitsView />;
      case 'files':
        return <FilesView />;
      case 'workflows':
        return <WorkflowsView />;
      case 'search':
        return <SearchView />;
      case 'audit':
        return <AuditLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onNavigate={setCurrentView}
            onOpenCreateRepo={() => setIsCreateRepoOpen(true)}
          />
        );
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {/* Active Tab View */}
      {renderView()}

      {/* Global Repository Creation Modal */}
      <CreateRepoModal
        isOpen={isCreateRepoOpen}
        onClose={() => setIsCreateRepoOpen(false)}
        onCreated={handleRepoCreated}
      />
    </Layout>
  );
};

/**
 * Root Application Component with hierarchical Context Providers:
 * 1. ToastProvider: Global notification toast system.
 * 2. AuthProvider: Authentication, tokens, rate limits, backend connectivity.
 * 3. ActiveRepoProvider: Active repository context and repository switcher.
 */
export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <ActiveRepoProvider>
          <AppContent />
        </ActiveRepoProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
