import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { NeumorphicPanel } from '../components/ui/NeumorphicPanel';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Save,
  Check,
  User,
  Mail,
  KeyRound,
  LogOut,
  Shield,
  AlertCircle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, signOut, updateProfile, resetPassword } = useAuth();
  const { navigate } = useRouter();

  const [fullName, setFullName] = useState(user?.fullName || 'Pilot User');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync profile full name when auth state initializes
  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user?.fullName]);

  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [workspace, setWorkspace] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('seekora_workspace_name') || 'Seekora AI Enterprise';
    }
    return 'Seekora AI Enterprise';
  });
  const [retention, setRetention] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('seekora_retention_days') || '30';
    }
    return '30';
  });
  const [defaultExport, setDefaultExport] = useState<'csv' | 'json'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seekora_default_export');
      if (stored === 'csv' || stored === 'json') return stored;
    }
    return 'csv';
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setProfileLoading(true);
    const ok = await updateProfile(fullName.trim());
    setProfileLoading(false);
    if (ok) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2200);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!user?.email || passwordLoading) return;
    setPasswordLoading(true);
    await resetPassword(user.email);
    setPasswordLoading(false);
    setPasswordResetSent(true);
    setTimeout(() => setPasswordResetSent(false), 4000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const handleSaveWorkspaceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('seekora_workspace_name', workspace.trim() || 'Seekora AI Enterprise');
      localStorage.setItem('seekora_retention_days', retention);
      localStorage.setItem('seekora_default_export', defaultExport);
    }
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#17181C]">Settings</h1>
        <p className="text-xs text-[#646974] mt-0.5">
          Manage your account profile, authentication security, and workspace preferences
        </p>
      </div>

      {/* 1. User Profile Section (Section 32) */}
      <NeumorphicPanel className="space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E4E7EC]">
          <div className="w-8 h-8 rounded-[10px] bg-[#EEF0F3] text-[#6D5DFB] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(163,170,181,0.20)]">
            <User size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#17181C]">User Profile</h2>
            <p className="text-[11px] text-[#646974]">
              Personal details synchronized with Supabase profiles
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex items-center gap-4 py-1">
            <div className="w-12 h-12 rounded-full bg-[#6D5DFB] text-white flex items-center justify-center font-bold text-base shadow-[3px_3px_8px_rgba(109,93,251,0.30)]">
              {(fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-[#17181C]">{fullName || 'Seekora User'}</p>
              <p className="text-xs text-[#646974] font-mono">{user?.email || 'user@seekora.ai'}</p>
            </div>
          </div>

          <div>
            <label htmlFor="settings-fullname-input" className="block text-xs font-semibold text-[#646974] mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <Input
              id="settings-fullname-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="settings-email-input" className="block text-xs font-semibold text-[#646974] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <Input
              id="settings-email-input"
              value={user?.email || ''}
              disabled
              icon={<Mail size={14} />}
              className="opacity-70 cursor-not-allowed font-mono text-xs"
            />
          </div>

          <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-between">
            {profileSaved ? (
              <span className="text-xs text-[#22A879] flex items-center gap-1 font-semibold">
                <Check size={14} /> Profile updated
              </span>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              size="sm"
              disabled={profileLoading}
              icon={profileSaved ? <Check size={14} /> : <Save size={14} />}
            >
              {profileLoading ? 'Saving...' : profileSaved ? 'Saved' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </NeumorphicPanel>

      {/* 2. Account Security & Sign Out Section (Section 32 & 33) */}
      <NeumorphicPanel className="space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E4E7EC]">
          <div className="w-8 h-8 rounded-[10px] bg-[#EEF0F3] text-[#6D5DFB] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(163,170,181,0.20)]">
            <Shield size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#17181C]">Account Security</h2>
            <p className="text-[11px] text-[#646974]">
              Password management and active session controls
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[12px] bg-[#EEF0F3] shadow-[inset_2px_2px_5px_rgba(163,170,181,0.18)]">
            <div>
              <p className="text-xs font-bold text-[#17181C]">Password</p>
              <p className="text-[11px] text-[#646974]">
                Send a secure reset link to your registered email address.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={passwordLoading}
              icon={<KeyRound size={13} />}
              onClick={handleRequestPasswordReset}
            >
              {passwordLoading ? 'Sending...' : 'Reset Password'}
            </Button>
          </div>

          {passwordResetSent && (
            <div className="p-3 rounded-[10px] bg-[#22A879]/10 border border-[#22A879]/25 text-xs text-[#22A879] flex items-center gap-2 animate-fadeIn">
              <Check size={14} />
              <span>Password reset instructions have been sent to your email.</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E4E7EC]">
            <div>
              <p className="text-xs font-bold text-[#17181C]">Active Session</p>
              <p className="text-[11px] text-[#646974]">
                Sign out of Seekora AI on this device.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<LogOut size={13} />}
              onClick={handleSignOut}
              className="text-[#D95C5C] hover:text-[#D95C5C]"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </NeumorphicPanel>

      {/* 3. Workspace Parameters */}
      <NeumorphicPanel className="space-y-5">
        <form onSubmit={handleSaveWorkspaceSettings} className="space-y-4">
          <h2 className="text-sm font-bold text-[#17181C] pb-2 border-b border-[#E4E7EC]">
            Workspace Parameters
          </h2>

          <div>
            <label htmlFor="settings-workspace-input" className="block text-xs font-semibold text-[#646974] mb-1.5 uppercase tracking-wider">
              Workspace Identifier
            </label>
            <Input
              id="settings-workspace-input"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="settings-retention-input" className="block text-xs font-semibold text-[#646974] mb-1.5 uppercase tracking-wider">
              Data Retention Period (Days)
            </label>
            <Input
              id="settings-retention-input"
              type="number"
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              min="7"
              max="365"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#646974] mb-1.5 uppercase tracking-wider">
              Default Export Format
            </label>
            <div className="flex gap-3">
              {(['csv', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setDefaultExport(fmt)}
                  className={`flex-1 py-2 rounded-[10px] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    defaultExport === fmt
                      ? 'bg-[#EEF0F3] text-[#6D5DFB] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.25),inset_-2px_-2px_5px_rgba(255,255,255,0.90)] border border-[#6D5DFB]/30'
                      : 'bg-[#F8F9FB] text-[#646974] hover:text-[#17181C] shadow-[3px_3px_8px_rgba(163,170,181,0.20),-3px_-3px_8px_rgba(255,255,255,0.90)] border border-[rgba(20,24,32,0.04)]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-between">
            {settingsSaved ? (
              <span className="text-xs text-[#22A879] flex items-center gap-1 font-semibold">
                <Check size={14} /> Preferences updated
              </span>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              size="sm"
              icon={settingsSaved ? <Check size={14} /> : <Save size={14} />}
            >
              {settingsSaved ? 'Saved' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </NeumorphicPanel>
    </div>
  );
};
