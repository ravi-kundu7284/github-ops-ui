import React, { useState } from 'react';
import { createOrUpdateFile } from '../../api/client';
import { useActiveRepo } from '../../context/ActiveRepoContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Modal } from '../common/Modal';

interface CreateEditFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialPath?: string;
  initialContent?: string;
  existingSha?: string;
}

export const CreateEditFileModal: React.FC<CreateEditFileModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialPath = '',
  initialContent = '',
  existingSha,
}) => {
  const { activeOwner, activeRepoName, activeRepo } = useActiveRepo();
  const { success, error } = useToast();

  const isEditing = Boolean(existingSha);
  const [filePath, setFilePath] = useState(initialPath);
  const [content, setContent] = useState(initialContent);
  const [commitMessage, setCommitMessage] = useState(
    isEditing ? `Update ${initialPath}` : `Create ${initialPath || 'new file'}`
  );
  const [branch, setBranch] = useState(activeRepo?.default_branch || 'main');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePath.trim() || !commitMessage.trim() || !activeOwner || !activeRepoName) return;

    setIsSubmitting(true);
    try {
      await createOrUpdateFile(activeOwner, activeRepoName, filePath.trim(), {
        message: commitMessage.trim(),
        content,
        sha: existingSha,
        branch: branch.trim() || undefined,
      });
      success(
        isEditing ? 'File updated!' : 'File created!',
        `Committed changes to ${filePath}`
      );
      onSaved();
      onClose();
    } catch (err: any) {
      error('Failed to commit file', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${initialPath}` : 'Create New File'}
      description={`Commit directly to ${activeOwner}/${activeRepoName}`}
      maxWidth="2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!filePath.trim() || !commitMessage.trim()}
          >
            {isEditing ? 'Commit Changes' : 'Create & Commit File'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="File Path *"
              placeholder="e.g. docs/guide.md or src/index.ts"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              disabled={isEditing}
              required
            />
          </div>

          <div>
            <Input
              label="Branch"
              placeholder={activeRepo?.default_branch || 'main'}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>
        </div>

        <Textarea
          label="File Content"
          placeholder="Type or paste file content..."
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Input
          label="Commit Message *"
          placeholder={isEditing ? 'Update file...' : 'Create new file...'}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          required
        />
      </form>
    </Modal>
  );
};

