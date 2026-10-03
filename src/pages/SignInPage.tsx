import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthHeader } from '../components/auth/AuthHeader';
import { PasswordInput } from '../components/auth/PasswordInput';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SignInCredentials } from '../services/authService';
import { supabaseConfigError } from '../lib/supabase';
import { ArrowRight, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { navigate } = useRouter();
  const { signIn } = useAuth();

  const [signupNotice] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const notice = sessionStorage.getItem('seekora_signup_notice');
      sessionStorage.removeItem('seekora_signup_notice');
      return notice;
    }
    return null;
  });

  const [formData, setFormData] = useState<SignInCredentials>(() => {
    let initialEmail = '';
    if (typeof window !== 'undefined') {
      initialEmail = sessionStorage.getItem('seekora_registered_email') || '';
      sessionStorage.removeItem('seekora_registered_email');
    }
    return {
      email: initialEmail,
      password: '',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleChange = (field: keyof SignInCredentials, value: string) => {
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

    const res = await signIn(formData);
    setLoading(false);

    if (res.success && res.session) {
      navigate('/dashboard');
    } else if (res.errors) {
      setErrors(res.errors);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to continue to your Seekora AI workspace."
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

      {/* New User Registration Success Banner */}
      {signupNotice && (
        <div className="mb-4 p-3.5 rounded-[12px] bg-[#22A879]/10 border border-[#22A879]/25 text-xs text-[#22A879] flex items-start gap-2.5 animate-fadeIn shadow-[inset_2px_2px_4px_rgba(34,168,121,0.08)]">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#22A879]" />
          <div>
            <p className="font-semibold text-[#17181C]">Registration Successful</p>
            <p className="text-[11px] text-[#22A879] mt-0.5">{signupNotice}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Form error */}
        {errors.form && (
          <div className="flex items-center gap-2 p-3 rounded-[10px] bg-[#D95C5C]/10 border border-[#D95C5C]/25 text-xs text-[#D95C5C] animate-fadeIn">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Email field */}
        <div className="space-y-1.5">
          <label
            htmlFor="signin-email"
            className="block text-xs font-semibold text-[#646974] uppercase tracking-wider"
          >
            Email
          </label>
          <Input
            id="signin-email"
            type="email"
            icon={<Mail size={15} />}
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Password field */}
        <div className="space-y-1">
          <PasswordInput
            id="signin-password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            disabled={loading}
          />

          {/* Forgot password trigger */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-medium text-[#646974] hover:text-[#6D5DFB] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              Forgot password?
            </button>
          </div>
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
                <span>Signing in...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>

        {/* Navigation to Sign Up */}
        <div className="pt-4 border-t border-[#E4E7EC] text-center space-y-1">
          <p className="text-xs text-[#646974]">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-semibold text-[#6D5DFB] hover:text-[#5B4AE8] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              Create account
            </button>
          </p>
        </div>
      </form>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={formData.email}
      />
    </AuthLayout>
  );
};
