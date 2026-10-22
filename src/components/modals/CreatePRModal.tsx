import React, { useState } from 'react';
import { createPullRequest } from '../../api/client';
import { useActiveRepo } from '../../context/ActiveRepoContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Modal } from '../common/Modal';

interface CreatePRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  branches: Array<{ name: string }>;
}

export const CreatePRModal: React.FC<CreatePRModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  branches,
}) => {
  const { activeOwner, activeRepoName, activeRepo } = useActiveRepo();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [head, setHead] = useState(branches[0]?.name || '');
  const [base, setBase] = useState(activeRepo?.default_branch || 'main');
  const [isDraft, setIsDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !head || !base || !activeOwner || !activeRepoName) return;

    setIsSubmitting(true);
    try {
      const pr = await createPullRequest(activeOwner, activeRepoName, {
        title: title.trim(),
        head,
        base,
        body: body.trim() || undefined,
        draft: isDraft,
      });
      success('Pull Request created!', `Created PR #${pr.number}: ${pr.title}`);
      setTitle('');
      setBody('');
      onCreated();
      onClose();
    } catch (err: any) {
      error('Failed to create pull request', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Pull Request"
      description={`Open a pull request in ${activeOwner}/${activeRepoName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!title.trim() || !head || !base}
          >
            Create Pull Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
          <div>
            <label className="text-xs font-semibold text-[#8b949e] block mb-1">
              Base Branch (Merge into)
            </label>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#2f81f7] outline-none"
            >
              {branches.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8b949e] block mb-1">
              Compare Branch (Head)
            </label>
            <select
              value={head}
              onChange={(e) => setHead(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#2f81f7] outline-none"
            >
              {branches.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Title *"
          placeholder="e.g. Implement user authentication flow"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description / Body"
          placeholder="Detailed description of changes, motivation, test notes..."
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#c9d1d9]">
          <input
            type="checkbox"
            checked={isDraft}
            onChange={(e) => setIsDraft(e.target.checked)}
            className="rounded border-[#30363d] bg-[#0d1117] text-[#2f81f7]"
          />
          <span>Create as draft pull request</span>
        </label>
      </form>
    </Modal>
  );
};

