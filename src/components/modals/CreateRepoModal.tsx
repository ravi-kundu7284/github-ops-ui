import React, { useState } from 'react';
import { createRepository } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Modal } from '../common/Modal';

interface CreateRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (repoFullName: string) => void;
}

export const CreateRepoModal: React.FC<CreateRepoModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [autoInit, setAutoInit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const repo = await createRepository({
        name: name.trim(),
        description: description.trim() || undefined,
        private: isPrivate,
        auto_init: autoInit,
      });
      success('Repository created!', `Created ${repo.full_name}`);
      setName('');
      setDescription('');
      onCreated(repo.full_name);
      onClose();
    } catch (err: any) {
      error('Failed to create repository', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a New Repository"
      description="Create a new repository for your account."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!name.trim()}
          >
            Create Repository
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Repository Name *"
          placeholder="e.g. awesome-agent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <Textarea
          label="Description (optional)"
          placeholder="Short description of this project"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex flex-col gap-3 pt-2 border-t border-[#30363d]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mt-0.5 rounded border-[#30363d] bg-[#0d1117] text-[#2f81f7] focus:ring-0"
            />
            <div>
              <span className="text-xs font-semibold text-[#f0f6fc]">Private repository</span>
              <p className="text-xs text-[#8b949e]">You choose who can see and commit to this repository.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoInit}
              onChange={(e) => setAutoInit(e.target.checked)}
              className="mt-0.5 rounded border-[#30363d] bg-[#0d1117] text-[#2f81f7] focus:ring-0"
            />
            <div>
              <span className="text-xs font-semibold text-[#f0f6fc]">Initialize with README</span>
              <p className="text-xs text-[#8b949e]">Recommended so you can immediately branch and commit.</p>
            </div>
          </label>
        </div>
      </form>
    </Modal>
  );
};

