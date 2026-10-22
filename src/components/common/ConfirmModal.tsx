/**
 * Destructive Operation Confirmation Dialog.
 *
 * Implements safety verification requirements for high-risk GitHub operations
 * (e.g. deleting repositories, closing active pull requests, force rebases).
 *
 * Safety features:
 * 1. Warning banner with exclamation icon detailing the irreversible consequences.
 * 2. Optional challenge verification: The user MUST type the exact challenge string
 *    (such as the repository name) before the confirmation button becomes enabled.
 */
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

/**
 * Props for the ConfirmModal component.
 */
export interface ConfirmModalProps {
  /** Boolean controlling dialog visibility */
  isOpen: boolean;
  /** Callback fired when user cancels or dismisses dialog */
  onClose: () => void;
  /** Async or sync callback executed when user confirms the destructive action */
  onConfirm: () => Promise<void> | void;
  /** Dialog headline title */
  title: string;
  /** Warning message explaining the consequences of the action */
  message: string;
  /** Text label on the submit button (defaults to 'Confirm Action') */
  confirmLabel?: string;
  /** Color variant of the submit button ('danger' for red, 'primary' for green) */
  confirmVariant?: 'danger' | 'primary';
  /** Required verification text that must be typed verbatim before enabling confirm button */
  challengeText?: string;
  /** Whether the async confirmation action is currently executing */
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  confirmVariant = 'danger',
  challengeText,
  isLoading = false,
}) => {
  const [typedChallenge, setTypedChallenge] = useState('');

  // If a challenge is specified, ensure user input matches exactly
  const isChallengeSatisfied = !challengeText || typedChallenge.trim() === challengeText.trim();

  const handleConfirm = async () => {
    if (!isChallengeSatisfied) return;
    await onConfirm();
    setTypedChallenge('');
  };

  const handleClose = () => {
    setTypedChallenge('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={!isChallengeSatisfied || isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Warning Alert Box */}
        <div className="flex items-start gap-3 p-3 bg-red-950/20 border border-red-800/40 rounded-lg text-red-300 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{message}</div>
        </div>

        {/* Verification Challenge Input (e.g. Type repo name to confirm) */}
        {challengeText && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#30363d]">
            <p className="text-xs text-[#8b949e]">
              To verify and proceed, please type <span className="font-mono text-white font-semibold">{challengeText}</span> below:
            </p>
            <Input
              value={typedChallenge}
              onChange={(e) => setTypedChallenge(e.target.value)}
              placeholder={challengeText}
              autoFocus
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
