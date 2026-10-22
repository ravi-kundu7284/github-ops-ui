import React, { useState, useEffect, useCallback } from 'react';
import {
  Copy,
  Edit3,
  File,
  FileCode,
  Folder,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { fetchContents } from '../api/client';
import { useActiveRepo } from '../context/ActiveRepoContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { CreateEditFileModal } from '../components/modals/CreateEditFileModal';
import { ContentItem } from '../types/github';

export const FilesView: React.FC = () => {
  const { activeOwner, activeRepoName } = useActiveRepo();
  const { success } = useToast();

  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const loadDirectoryOrFile = useCallback(async (path: string) => {
    if (!activeOwner || !activeRepoName) return;
    setIsLoading(true);
    try {
      const data = await fetchContents(activeOwner, activeRepoName, path);
      if (Array.isArray(data)) {
        // Directory
        setItems(
          data.sort((a, b) => {
            if (a.type === 'dir' && b.type !== 'dir') return -1;
            if (a.type !== 'dir' && b.type === 'dir') return 1;
            return a.name.localeCompare(b.name);
          })
        );
        setSelectedFile(null);
        setCurrentPath(path);
      } else {
        // Single File
        setSelectedFile(data);
        setCurrentPath(path);
      }
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  }, [activeOwner, activeRepoName]);

  useEffect(() => {
    loadDirectoryOrFile('');
  }, [loadDirectoryOrFile]);

  const handleItemClick = (item: ContentItem) => {
    loadDirectoryOrFile(item.path);
  };

  const handleBreadcrumbClick = (targetPath: string) => {
    loadDirectoryOrFile(targetPath);
  };

  const handleCopyContent = () => {
    if (selectedFile?.decoded_content) {
      navigator.clipboard.writeText(selectedFile.decoded_content);
      success('Copied', 'File contents copied to clipboard');
    }
  };

  // Breadcrumb segments
  const pathSegments = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <FileCode className="w-5 h-5 text-sky-400" />
            File &amp; Code Browser
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
            onClick={() => loadDirectoryOrFile(currentPath)}
            disabled={isLoading}
          >
            Refresh
          </Button>

          {selectedFile ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Edit3 className="w-4 h-4" />}
              onClick={() => {
                setModalMode('edit');
                setIsModalOpen(true);
              }}
            >
              Edit File
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setModalMode('create');
                setIsModalOpen(true);
              }}
            >
              New File
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center gap-2 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => handleBreadcrumbClick('')}
          className="text-sky-400 hover:underline font-semibold"
        >
          {activeRepoName}
        </button>
        {pathSegments.map((seg, idx) => {
          const subPath = pathSegments.slice(0, idx + 1).join('/');
          const isLast = idx === pathSegments.length - 1;
          return (
            <React.Fragment key={subPath}>
              <span className="text-[#8b949e]">/</span>
              {isLast ? (
                <span className="text-white font-semibold">{seg}</span>
              ) : (
                <button
                  onClick={() => handleBreadcrumbClick(subPath)}
                  className="text-sky-400 hover:underline"
                >
                  {seg}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Content Area */}
      {selectedFile ? (
        /* File Viewer */
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
          <div className="p-3 border-b border-[#30363d] bg-[#0d1117] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <File className="w-4 h-4 text-sky-400" />
              <span>{selectedFile.name}</span>
              <span className="text-[#8b949e]">({selectedFile.size} bytes)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyContent}
                className="p-1.5 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
                title="Copy contents"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#0d1117] overflow-x-auto max-h-[600px]">
            {selectedFile.decoded_content !== undefined && selectedFile.decoded_content !== null ? (
              <pre className="font-mono text-xs leading-relaxed text-[#c9d1d9] whitespace-pre">
                {selectedFile.decoded_content}
              </pre>
            ) : (
              <div className="p-8 text-center text-xs text-[#8b949e] italic">
                Binary or unsupported content format.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Directory Items Table */
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
          {pathSegments.length > 0 && (
            <div
              onClick={() => {
                const parentPath = pathSegments.slice(0, -1).join('/');
                handleBreadcrumbClick(parentPath);
              }}
              className="p-3 flex items-center gap-3 hover:bg-[#21262d]/50 cursor-pointer text-xs font-mono text-sky-400"
            >
              <span>.. (Up to parent folder)</span>
            </div>
          )}

          {items.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#8b949e]">
              {isLoading ? 'Loading directory contents...' : 'Folder is empty.'}
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.path}
                onClick={() => handleItemClick(item)}
                className="p-3 flex items-center justify-between gap-4 hover:bg-[#21262d]/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.type === 'dir' ? (
                    <Folder className="w-4 h-4 text-sky-400 shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-[#8b949e] shrink-0" />
                  )}
                  <span className="font-mono text-xs text-[#f0f6fc] hover:text-[#2f81f7] truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e] shrink-0">
                  {item.type === 'file' && <span>{item.size} B</span>}
                  <span>{item.type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit File Modal */}
      {isModalOpen && (
        <CreateEditFileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            loadDirectoryOrFile(currentPath);
          }}
          initialPath={modalMode === 'edit' && selectedFile ? selectedFile.path : currentPath ? `${currentPath}/` : ''}
          initialContent={modalMode === 'edit' && selectedFile ? selectedFile.decoded_content || '' : ''}
          existingSha={modalMode === 'edit' && selectedFile ? selectedFile.sha : undefined}
        />
      )}
    </div>
  );
};

