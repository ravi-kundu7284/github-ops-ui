import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { clearOperations, fetchOperations } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { OperationLog } from '../types/github';

export const AuditLogsView: React.FC = () => {
  const { success, error } = useToast();
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [channelFilter, setChannelFilter] = useState<'all' | 'rest' | 'mcp'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Inspector modal
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchOperations({
        channel: channelFilter === 'all' ? undefined : channelFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 150,
      });
      setLogs(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  }, [channelFilter, statusFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleClear = async () => {
    try {
      await clearOperations();
      success('Audit logs cleared', 'All in-memory operation logs have been reset');
      setLogs([]);
    } catch (err: any) {
      error('Failed to clear logs', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <History className="w-5 h-5 text-sky-400" />
            Operation History &amp; Audit Log ({logs.length})
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Real-time telemetry of operations dispatched via REST API and Model Context Protocol (MCP) tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadLogs}
            disabled={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={handleClear}
            disabled={logs.length === 0}
          >
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-wrap items-center justify-between gap-3">
        {/* Channel Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8b949e] font-semibold">Channel:</span>
          {(['all', 'rest', 'mcp'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setChannelFilter(c)}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase font-mono transition-colors ${
                channelFilter === c
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8b949e] font-semibold">Status:</span>
          {(['all', 'success', 'error'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#8b949e]">
            {isLoading ? 'Loading logs...' : 'No operation logs recorded yet.'}
          </div>
        ) : (
          logs.map((log) => {
            const isSuccess = log.status === 'success';
            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#21262d]/50 cursor-pointer transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}

                    <span className="font-mono text-sm font-bold text-[#f0f6fc]">
                      {log.operation}
                    </span>

                    <Badge variant={log.channel === 'mcp' ? 'purple' : 'info'} size="sm">
                      {log.channel.toUpperCase()}
                    </Badge>

                    <Badge variant={isSuccess ? 'success' : 'danger'} size="sm">
                      {log.status}
                    </Badge>

                    <span className="flex items-center gap-1 font-mono text-xs text-[#8b949e]">
                      <Clock className="w-3 h-3" />
                      {log.duration_ms} ms
                    </span>
                  </div>

                  {log.result_summary && (
                    <p className="text-xs text-slate-300 font-mono truncate">{log.result_summary}</p>
                  )}
                  {log.error && (
                    <p className="text-xs text-red-400 font-mono truncate">{log.error}</p>
                  )}
                </div>

                <div className="text-xs font-mono text-[#8b949e] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Operation: ${selectedLog.operation}`}
          description={`ID: ${selectedLog.id}`}
          maxWidth="2xl"
          footer={
            <Button variant="secondary" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
              <div>
                <span className="text-[#8b949e] block">Channel</span>
                <span className="text-white font-bold">{selectedLog.channel.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-[#8b949e] block">Status</span>
                <span className={selectedLog.status === 'success' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {selectedLog.status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-[#8b949e] block">Execution Duration</span>
                <span className="text-white">{selectedLog.duration_ms} ms</span>
              </div>
              <div>
                <span className="text-[#8b949e] block">Timestamp</span>
                <span className="text-white">{new Date(selectedLog.timestamp).toISOString()}</span>
              </div>
            </div>

            {selectedLog.result_summary && (
              <div>
                <span className="text-[#8b949e] font-semibold block mb-1">Result Summary</span>
                <div className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded text-emerald-300">
                  {selectedLog.result_summary}
                </div>
              </div>
            )}

            {selectedLog.error && (
              <div>
                <span className="text-[#8b949e] font-semibold block mb-1">Error Details</span>
                <div className="p-2.5 bg-red-950/20 border border-red-800/40 rounded text-red-300 whitespace-pre-wrap">
                  {selectedLog.error}
                </div>
              </div>
            )}

            <div>
              <span className="text-[#8b949e] font-semibold block mb-1">Sanitized Parameters</span>
              <pre className="p-3 bg-[#010409] border border-[#30363d] rounded text-slate-300 overflow-x-auto whitespace-pre">
                {JSON.stringify(selectedLog.parameters, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

