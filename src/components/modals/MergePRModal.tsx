import React, { useState } from 'react';
import { mergePullRequest } from '../../api/client';
import { useActiveRepo } from '../../context/ActiveRepoContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Modal } from '../common/Modal';

interface MergePRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMerged: () => void;
  pullNumber: number;
  prTitle: string;
}

export const MergePRModal: React.FC<MergePRModalProps> = ({
  isOpen,
  onClose,
  onMerged,
  pullNumber,
  prTitle,
}) => {
  const { activeOwner, activeRepoName } = useActiveRepo();
  const { success, error } = useToast();

  const [mergeMethod, setMergeMethod] = useState<'merge' | 'squash' | 'rebase'>('merge');
  const [commitTitle, setCommitTitle] = useState(`Merge pull request #${pullNumber} from branch`);
  const [commitMessage, setCommitMessage] = useState(prTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMerge = async () => {
    if (!activeOwner || !activeRepoName) return;

    setIsSubmitting(true);
    try {
      await mergePullRequest(activeOwner, activeRepoName, pullNumber, {
        merge_method: mergeMethod,
        commit_title: commitTitle || undefined,
        commit_message: commitMessage || undefined,
      });
      success('PR Merged!', `Successfully merged PR #${pullNumber}`);
      onMerged();
      onClose();
    } catch (err: any) {
      error('Failed to merge pull request', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirm Merge: PR #${pullNumber}`}
      description={prTitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleMerge}
            isLoading={isSubmitting}
          >
            Confirm & Merge
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-[#8b949e] block mb-1">
            Merge Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'merge', label: 'Create Merge Commit', desc: 'All commits will be preserved' },
              { id: 'squash', label: 'Squash & Merge', desc: 'Combine commits into one' },
              { id: 'rebase', label: 'Rebase & Merge', desc: 'Rebase onto target branch' },
            ].map((m) => (
              <label
                key={m.id}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  mergeMethod === m.id
                    ? 'border-emerald-500 bg-emerald-950/20 text-white'
                    : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#8b949e]'
                }`}
              >
                <input
                  type="radio"
                  name="merge_method"
                  value={m.id}
                  checked={mergeMethod === m.id}
                  onChange={() => setMergeMethod(m.id as any)}
                  className="sr-only"
                />
                <div className="text-xs font-semibold">{m.label}</div>
                <div className="text-[10px] text-[#8b949e] mt-0.5 leading-tight">{m.desc}</div>
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Commit Title"
          value={commitTitle}
          onChange={(e) => setCommitTitle(e.target.value)}
        />

        <Textarea
          label="Commit Details / Extended Message"
          rows={3}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
        />
      </div>
    </Modal>
  );
};

