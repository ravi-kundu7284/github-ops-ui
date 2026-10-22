import React, { useState } from 'react';
import { reviewPullRequest } from '../../api/client';
import { useActiveRepo } from '../../context/ActiveRepoContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Textarea } from '../common/Input';
import { Modal } from '../common/Modal';

interface ReviewPRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewed: () => void;
  pullNumber: number;
  prTitle: string;
}

export const ReviewPRModal: React.FC<ReviewPRModalProps> = ({
  isOpen,
  onClose,
  onReviewed,
  pullNumber,
  prTitle,
}) => {
  const { activeOwner, activeRepoName } = useActiveRepo();
  const { success, error } = useToast();

  const [event, setEvent] = useState<'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'>('APPROVE');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !activeOwner || !activeRepoName) return;

    setIsSubmitting(true);
    try {
      await reviewPullRequest(activeOwner, activeRepoName, pullNumber, {
        event,
        body: body.trim(),
      });
      success('Review submitted!', `Submitted ${event} review on PR #${pullNumber}`);
      setBody('');
      onReviewed();
      onClose();
    } catch (err: any) {
      error('Failed to submit review', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review PR #${pullNumber}`}
      description={prTitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={event === 'REQUEST_CHANGES' ? 'danger' : 'primary'}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!body.trim()}
          >
            Submit Review
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#8b949e]">Review Decision</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'APPROVE', label: 'Approve', desc: 'Submit feedback and approve' },
              { id: 'COMMENT', label: 'Comment', desc: 'General feedback without approval' },
              { id: 'REQUEST_CHANGES', label: 'Request Changes', desc: 'Submit feedback that must be addressed' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  event === opt.id
                    ? 'border-[#2f81f7] bg-[#2f81f7]/10 text-white'
                    : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#8b949e]'
                }`}
              >
                <input
                  type="radio"
                  name="review_event"
                  value={opt.id}
                  checked={event === opt.id}
                  onChange={() => setEvent(opt.id as any)}
                  className="sr-only"
                />
                <div className="text-xs font-semibold">{opt.label}</div>
                <div className="text-[10px] text-[#8b949e] mt-0.5 leading-tight">{opt.desc}</div>
              </label>
            ))}
          </div>
        </div>

        <Textarea
          label="Review Comments *"
          placeholder="Write your review comments here..."
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </form>
    </Modal>
  );
};
