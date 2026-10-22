import React, { useState } from 'react';
import { closeIssue } from '../../api/client';
import { useActiveRepo } from '../../context/ActiveRepoContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Textarea } from '../common/Input';
import { Modal } from '../common/Modal';

interface CloseIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClosed: () => void;
  issueNumber: number;
  issueTitle: string;
}

export const CloseIssueModal: React.FC<CloseIssueModalProps> = ({
  isOpen,
  onClose,
  onClosed,
  issueNumber,
  issueTitle,
}) => {
  const { activeOwner, activeRepoName } = useActiveRepo();
  const { success, error } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseIssue = async () => {
    if (!activeOwner || !activeRepoName) return;

    setIsSubmitting(true);
    try {
      await closeIssue(activeOwner, activeRepoName, issueNumber, comment.trim() || undefined);
      success('Issue closed!', `Issue #${issueNumber} has been closed`);
      setComment('');
      onClosed();
      onClose();
    } catch (err: any) {
      error('Failed to close issue', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Close Issue #${issueNumber}`}
      description={issueTitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleCloseIssue}
            isLoading={isSubmitting}
          >
            Close Issue
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[#8b949e]">
          Are you sure you want to close this issue? You can optionally add a final resolution comment below.
        </p>

        <Textarea
          label="Closing Comment (optional)"
          placeholder="e.g. Resolved in release v1.2.0"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
};

