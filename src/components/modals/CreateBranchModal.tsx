import React, { useState } from 'react';
import { createBranch } from '../../api/client';
import { useActiveRepo } from '../../context/ActiveRepoContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { activeOwner, activeRepoName, activeRepo } = useActiveRepo();
  const { success, error } = useToast();
  const [branchName, setBranchName] = useState('');
  const [fromBranch, setFromBranch] = useState(activeRepo?.default_branch || 'main');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !activeOwner || !activeRepoName) return;

    setIsSubmitting(true);
    try {
      await createBranch(activeOwner, activeRepoName, {
        branch: branchName.trim(),
        from_branch: fromBranch.trim() || undefined,
      });
      success('Branch created!', `Branch '${branchName}' created successfully`);
      setBranchName('');
      onCreated();
      onClose();
    } catch (err: any) {
      error('Failed to create branch', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Branch"
      description={`Create a new branch in ${activeOwner}/${activeRepoName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!branchName.trim()}
          >
            Create Branch
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Branch Name *"
          placeholder="e.g. feature/new-workflow"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          required
          autoFocus
        />

        <Input
          label="Source Branch or Commit SHA"
          placeholder={activeRepo?.default_branch || 'main'}
          value={fromBranch}
          onChange={(e) => setFromBranch(e.target.value)}
          hint="Leave empty or default to branch from the default branch"
        />
      </form>
    </Modal>
  );
};

