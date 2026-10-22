import React, { useState } from 'react';
import { createIssue } from '../../api/client';
import { useActiveRepo } from '../../context/ActiveRepoContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Modal } from '../common/Modal';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { activeOwner, activeRepoName } = useActiveRepo();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [labels, setLabels] = useState('');
  const [assignees, setAssignees] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeOwner || !activeRepoName) return;

    setIsSubmitting(true);
    try {
      const labelsList = labels
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);
      const assigneesList = assignees
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const issue = await createIssue(activeOwner, activeRepoName, {
        title: title.trim(),
        body: body.trim() || undefined,
        labels: labelsList.length > 0 ? labelsList : undefined,
        assignees: assigneesList.length > 0 ? assigneesList : undefined,
      });

      success('Issue created!', `Created issue #${issue.number}: ${issue.title}`);
      setTitle('');
      setBody('');
      setLabels('');
      setAssignees('');
      onCreated();
      onClose();
    } catch (err: any) {
      error('Failed to create issue', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Issue"
      description={`Submit a new issue to ${activeOwner}/${activeRepoName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!title.trim()}
          >
            Submit New Issue
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title *"
          placeholder="Issue title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <Textarea
          label="Description / Markdown Body"
          placeholder="Describe the issue, steps to reproduce, or expected behavior..."
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Labels (comma-separated)"
            placeholder="bug, enhancement, documentation"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
          />

          <Input
            label="Assignees (comma-separated usernames)"
            placeholder="octocat, user2"
            value={assignees}
            onChange={(e) => setAssignees(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

