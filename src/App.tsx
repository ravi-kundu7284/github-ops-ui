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

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isCreateRepoOpen, setIsCreateRepoOpen] = useState(false);
  const { selectRepoByFullName, reloadRepositories } = useActiveRepo();

  const handleSelectRepo = (repo: any) => {
    selectRepoByFullName(repo.full_name);
    setCurrentView('branches');
  };

  const handleRepoCreated = async (fullName: string) => {
    await reloadRepositories();
    await selectRepoByFullName(fullName);
    setCurrentView('repositories');
  };

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
      {renderView()}

      <CreateRepoModal
        isOpen={isCreateRepoOpen}
        onClose={() => setIsCreateRepoOpen(false)}
        onCreated={handleRepoCreated}
      />
    </Layout>
  );
};

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
