import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthHeader } from '../components/auth/AuthHeader';
import { PasswordInput } from '../components/auth/PasswordInput';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SignUpCredentials } from '../services/authService';
import { supabaseConfigError } from '../lib/supabase';
import { ArrowRight, User, Mail, AlertCircle, Inbox } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { navigate } = useRouter();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState<SignUpCredentials>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  const handleChange = (field: keyof SignUpCredentials, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field] || errors.form) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        delete next.form;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    const res = await signUp(formData);
    setLoading(false);

    if (res.success) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('seekora_registered_email', formData.email.trim());
        if (res.requiresEmailConfirmation) {
          sessionStorage.setItem(
            'seekora_signup_notice',
            'Account created! Please check your email to confirm your account, then sign in.'
          );
        } else {
          sessionStorage.setItem(
            'seekora_signup_notice',
            'Account created successfully! Please sign in with your credentials.'
          );
        }
      }
      navigate('/signin');
    } else if (res.errors) {
      setErrors(res.errors);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Create your account"
        subtitle="Start building intelligent data collections with Seekora AI."
      />

      {/* Supabase configuration missing warning (Section 3) */}
      {supabaseConfigError && (
        <div className="mb-4 p-3 rounded-[12px] bg-[#C98A25]/10 border border-[#C98A25]/25 text-xs text-[#C98A25] flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Supabase configuration is missing.</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment.
            </p>
          </div>
        </div>
      )}

      {emailConfirmationRequired ? (
        /* Section 4 & 5: Email Verification Screen */
        <div className="text-center py-6 space-y-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-[#6D5DFB]/15 text-[#6D5DFB] flex items-center justify-center mx-auto">
            <Inbox size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#17181C]">Account created</h3>
            <p className="text-xs text-[#646974] max-w-xs mx-auto">
              Please check your email to confirm your account. We&apos;ve sent a confirmation link to{' '}
              <strong className="text-[#17181C] font-semibold">{formData.email}</strong>.
            </p>
          </div>
          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate('/signin')}
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors.form && (
            <div className="flex items-center gap-2 p-3 rounded-[10px] bg-[#D95C5C]/10 border border-[#D95C5C]/25 text-xs text-[#D95C5C] animate-fadeIn">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="signup-name"
              className="block text-xs font-semibold text-[#646974] uppercase tracking-wider"
            >
              Full Name
            </label>
            <Input
              id="signup-name"
              type="text"
              icon={<User size={15} />}
              placeholder="Enter your name"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={errors.fullName}
              autoComplete="name"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="signup-email"
              className="block text-xs font-semibold text-[#646974] uppercase tracking-wider"
            >
              Email
            </label>
            <Input
              id="signup-email"
              type="email"
              icon={<Mail size={15} />}
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password with helper */}
          <div>
            <PasswordInput
              id="signup-password"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              helperText="Password must contain at least 8 characters."
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <PasswordInput
              id="signup-confirm-password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {/* Primary Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
              icon={!loading && <ArrowRight size={15} />}
              iconPosition="right"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Creating account...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>

          {/* Navigation to Sign In */}
          <div className="pt-4 border-t border-[#E4E7EC] text-center space-y-1">
            <p className="text-xs text-[#646974]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="font-semibold text-[#6D5DFB] hover:text-[#5B4AE8] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
