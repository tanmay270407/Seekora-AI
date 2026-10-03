import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { authService } from '../../services/authService';
import { Mail, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isOpen && defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [isOpen, defaultEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await authService.requestPasswordReset(email);
    setLoading(false);

    if (res.success) {
      setSent(true);
    } else if (res.errors?.email) {
      setError(res.errors.email);
    }
  };

  const handleClose = () => {
    setSent(false);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Password">
      {sent ? (
        <div className="text-center py-4 space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#22A879]/15 text-[#22A879] flex items-center justify-center mx-auto">
            <CheckCircle2 size={20} />
          </div>
          <h4 className="text-sm font-bold text-[#17181C]">Check your inbox</h4>
          <p className="text-xs text-[#646974] max-w-xs mx-auto">
            If an account exists for this email, you&apos;ll receive a password reset link.
          </p>
          <div className="pt-2">
            <Button size="sm" onClick={handleClose} className="w-full">
              Back to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-[#646974]">
            Enter your account email to receive a password reset link.
          </p>

          <div>
            <label htmlFor="forgot-password-email-input" className="block text-xs font-semibold text-[#646974] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <Input
              id="forgot-password-email-input"
              type="email"
              icon={<Mail size={14} />}
              placeholder="developer@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error || undefined}
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
