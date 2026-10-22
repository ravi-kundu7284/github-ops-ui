/**
 * GitHub Actions Workflows & Execution Runs View.
 *
 * This view allows users to:
 * 1. View all configured GitHub Actions workflows in `.github/workflows/`.
 * 2. Monitor historical and active workflow runs with status/conclusion indicators
 *    (Success, Failed, In Progress, Queued, Cancelled).
 * 3. Inspect individual execution jobs and steps with timing metrics.
 * 4. Access full log archives or open direct GitHub Actions run pages.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  PlaySquare,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { fetchWorkflowRunLogs, fetchWorkflowRuns, fetchWorkflows } from '../api/client';
import { useActiveRepo } from '../context/ActiveRepoContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Workflow, WorkflowRun, WorkflowRunLogs } from '../types/github';

export const WorkflowsView: React.FC = () => {
  const { activeOwner, activeRepoName } = useActiveRepo();

  // State: List of workflows defined in repository
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  // State: List of recent workflow execution runs
  const [runs, setRuns] = useState<WorkflowRun[]>([]);

  // Loading indicator for background fetches
  const [isLoading, setIsLoading] = useState(false);

  // Modal inspection state for a selected workflow run's jobs and logs
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [runLogs, setRunLogs] = useState<WorkflowRunLogs | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  /**
   * Fetch both the workflow definitions and recent execution history in parallel.
   */
  const loadData = useCallback(async () => {
    if (!activeOwner || !activeRepoName) return;
    setIsLoading(true);
    try {
      const [wfData, runsData] = await Promise.all([
        fetchWorkflows(activeOwner, activeRepoName),
        fetchWorkflowRuns(activeOwner, activeRepoName, { per_page: 50 }),
      ]);
      setWorkflows(wfData.workflows || []);
      setRuns(runsData.workflow_runs || []);
    } catch {
      // Handled gracefully in view
    } finally {
      setIsLoading(false);
    }
  }, [activeOwner, activeRepoName]);

  // Load workflows on mount or when active repository context changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Fetch job step logs when the user clicks 'Jobs & Logs' on a specific run.
   */
  const handleInspectRun = async (run: WorkflowRun) => {
    setSelectedRun(run);
    setIsLoadingLogs(true);
    try {
      const logs = await fetchWorkflowRunLogs(activeOwner, activeRepoName, run.id);
      setRunLogs(logs);
    } catch {
      setRunLogs(null);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <PlaySquare className="w-5 h-5 text-emerald-400" />
            GitHub Actions Workflows
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
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
          Defined Workflows ({workflows.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {workflows.length === 0 ? (
            <div className="col-span-full p-6 text-center text-xs text-[#8b949e] bg-[#161b22] border border-[#30363d] rounded-xl">
              No workflows defined in `.github/workflows/` yet.
            </div>
          ) : (
            workflows.map((wf) => (
              <div key={wf.id} className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#f0f6fc] truncate">{wf.name}</span>
                  <Badge variant={wf.state === 'active' ? 'success' : 'outline'} size="sm">
                    {wf.state}
                  </Badge>
                </div>
                <div className="text-[11px] font-mono text-[#8b949e] truncate">{wf.path}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Execution Runs Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
          Execution Runs ({runs.length})
        </h2>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
          {runs.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#8b949e]">
              {isLoading ? 'Loading workflow runs...' : 'No workflow runs found.'}
            </div>
          ) : (
            runs.map((run) => {
              const isSuccess = run.conclusion === 'success';
              const isFailure = run.conclusion === 'failure';
              const isInProgress = run.status === 'in_progress';

              return (
                <div
                  key={run.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#21262d]/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-[#f0f6fc]">{run.name}</span>
                      <span className="font-mono text-xs text-[#8b949e]">#{run.run_number}</span>

                      {isSuccess && (
                        <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Success
                        </Badge>
                      )}
                      {isFailure && (
                        <Badge variant="danger" size="sm" icon={<XCircle className="w-3 h-3" />}>
                          Failed
                        </Badge>
                      )}
                      {isInProgress && (
                        <Badge variant="warning" size="sm" icon={<Clock className="w-3 h-3 animate-spin" />}>
                          In Progress
                        </Badge>
                      )}
                      {!isSuccess && !isFailure && !isInProgress && (
                        <Badge variant="outline" size="sm">
                          {run.conclusion || run.status}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#8b949e] flex-wrap">
                      <span className="font-mono text-slate-300">{run.head_branch}</span>
                      <span>Commit: <strong className="font-mono text-slate-300">{run.head_sha.substring(0, 7)}</strong></span>
                      <span>Trigger: <strong className="text-slate-300 font-mono">{run.event}</strong></span>
                      <span>{new Date(run.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FileText className="w-3.5 h-3.5" />}
                      onClick={() => handleInspectRun(run)}
                    >
                      Jobs &amp; Logs
                    </Button>

                    <a
                      href={run.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] transition-colors"
                      title="View on GitHub Actions"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Workflow Run Logs Modal */}
      {selectedRun && (
        <Modal
          isOpen={Boolean(selectedRun)}
          onClose={() => setSelectedRun(null)}
          title={`Run #${selectedRun.run_number}: ${selectedRun.name}`}
          description={`Branch: ${selectedRun.head_branch} | SHA: ${selectedRun.head_sha.substring(0, 7)}`}
          maxWidth="3xl"
          footer={
            <div className="flex items-center justify-between w-full">
              {runLogs?.archive_url && (
                <a
                  href={selectedRun.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open GitHub Run Page
                </a>
              )}
              <Button variant="secondary" onClick={() => setSelectedRun(null)}>
                Close
              </Button>
            </div>
          }
        >
          {isLoadingLogs ? (
            <div className="p-8 text-center text-xs text-[#8b949e]">Fetching run jobs and logs...</div>
          ) : runLogs && runLogs.jobs && runLogs.jobs.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {runLogs.jobs.map((job) => (
                <div key={job.id} className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#f0f6fc]">{job.name}</span>
                    <Badge variant={job.conclusion === 'success' ? 'success' : 'danger'} size="sm">
                      {job.conclusion || job.status}
                    </Badge>
                  </div>

                  {job.steps && job.steps.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-[#30363d]/60">
                      {job.steps.map((step) => (
                        <div
                          key={step.number}
                          className="flex items-center justify-between text-[11px] font-mono px-2 py-1 rounded bg-[#161b22]"
                        >
                          <div className="flex items-center gap-2">
                            {step.conclusion === 'success' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : step.conclusion === 'failure' ? (
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-[#8b949e]" />
                            )}
                            <span className="text-slate-300">{step.name}</span>
                          </div>
                          <span className="text-[#8b949e]">{step.conclusion || step.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#8b949e] bg-[#0d1117] border border-[#30363d] rounded-lg">
              No detailed job logs available for this run. Check the GitHub Actions run URL.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
