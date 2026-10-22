import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmModal } from './ConfirmModal';

describe('ConfirmModal Component', () => {
  it('renders modal with message and title when open', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Repository"
        message="This is a permanent destructive action."
        challengeText="my-cool-repo"
      />
    );

    expect(screen.getByText('Delete Repository')).toBeInTheDocument();
    expect(screen.getByText('This is a permanent destructive action.')).toBeInTheDocument();
  });

  it('keeps confirm button disabled until challenge text matches exactly', async () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
        title="Delete Repository"
        message="Warning"
        challengeText="my-cool-repo"
        confirmLabel="Delete this repository"
      />
    );

    const confirmBtn = screen.getByText('Delete this repository');
    expect(confirmBtn).toBeDisabled();

    const input = screen.getByPlaceholderText('my-cool-repo');

    // Type partial or wrong text
    await act(async () => {
      fireEvent.change(input, { target: { value: 'my-cool' } });
    });
    expect(confirmBtn).toBeDisabled();

    // Type exact challenge
    await act(async () => {
      fireEvent.change(input, { target: { value: 'my-cool-repo' } });
    });
    expect(confirmBtn).not.toBeDisabled();

    // Click confirm
    await act(async () => {
      fireEvent.click(confirmBtn);
    });
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});

