import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  challengeText?: string;
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
        <div className="flex items-start gap-3 p-3 bg-red-950/20 border border-red-800/40 rounded-lg text-red-300 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{message}</div>
        </div>

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
