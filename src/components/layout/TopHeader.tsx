import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Menu, Bell, User, LogIn, ExternalLink, LogOut, Settings } from 'lucide-react';
import { Dropdown } from '../ui/Dropdown';

interface TopHeaderProps {
  onToggleSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleSidebar }) => {
  const { path, navigate } = useRouter();
  const { user, signOut, isAuthenticated } = useAuth();
  const { collections } = useData();
  const [hasUnread] = useState(true);

  // Derive page title
  const getPageTitle = () => {
    if (path === '/dashboard' || path === '/') return 'Dashboard';
    if (path === '/collections/new') return 'New Collection';
    if (path.startsWith('/collections/')) return 'Collection';
    if (path === '/collections') return 'Collections';
    if (path.startsWith('/results/')) return 'Results';
    if (path === '/sources') return 'Sources';
    if (path === '/history') return 'History';
    if (path === '/settings') return 'Settings';
    if (path === '/signin') return 'Sign In';
    if (path === '/signup') return 'Sign Up';
    return 'Seekora AI';
  };

  const latestCol = collections[0];

  const notificationItems = [
    {
      id: 'notif-1',
      label: latestCol
        ? `${latestCol.title}: ${latestCol.recordCount} records ready`
        : 'Seekora pipeline ready for queries',
      onClick: () =>
        navigate(latestCol ? `/results/${latestCol.id}` : '/collections/new'),
    },
    {
      id: 'notif-2',
      label: 'Demo source registry active',
      onClick: () => navigate('/sources'),
    },
    {
      id: 'notif-3',
      label: 'Dataset export available in CSV and JSON',
      onClick: () => navigate('/history'),
    },
  ];

  const profileMenuItems = isAuthenticated
    ? [
        {
          id: 'menu-profile',
          label: user?.fullName || 'Pilot User',
          onClick: () => navigate('/settings'),
        },
        {
          id: 'menu-settings',
          label: 'Settings',
          icon: <Settings size={13} />,
          onClick: () => navigate('/settings'),
        },
        {
          id: 'menu-logout',
          label: 'Sign Out',
          icon: <LogOut size={13} />,
          onClick: async () => {
            await signOut();
            navigate('/signin');
          },
        },
      ]
    : [
        {
          id: 'menu-signin',
          label: 'Sign In',
          icon: <LogIn size={13} />,
          onClick: () => navigate('/signin'),
        },
        {
          id: 'menu-signup',
          label: 'Create Account',
          icon: <ExternalLink size={13} />,
          onClick: () => navigate('/signup'),
        },
      ];

  const displayName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Pilot';

  return (
    <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-[rgba(20,24,32,0.06)] bg-[#F4F5F7] sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
          className="lg:hidden w-9 h-9 rounded-[10px] bg-[#F8F9FB] flex items-center justify-center text-[#646974] hover:text-[#17181C] shadow-[4px_4px_10px_rgba(163,170,181,0.25),-4px_-4px_10px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)] cursor-pointer"
        >
          <Menu size={18} />
        </button>

        {/* Page Title */}
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#17181C]">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <div className="w-9 h-9 rounded-[10px] bg-[#F8F9FB] flex items-center justify-center text-[#646974] hover:text-[#17181C] transition-all shadow-[4px_4px_10px_rgba(163,170,181,0.22),-4px_-4px_10px_rgba(255,255,255,0.95)] active:shadow-[inset_3px_3px_6px_rgba(163,170,181,0.30)] border border-[rgba(20,24,32,0.04)] relative cursor-pointer">
              <Bell size={16} />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#6D5DFB]" />
              )}
            </div>
          }
          items={notificationItems}
        />

        {/* User Profile Menu */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-[12px] bg-[#F8F9FB] shadow-[4px_4px_10px_rgba(163,170,181,0.22),-4px_-4px_10px_rgba(255,255,255,0.95)] hover:shadow-[5px_5px_12px_rgba(163,170,181,0.30)] border border-[rgba(20,24,32,0.04)] transition-all cursor-pointer">
              <div className="w-7 h-7 rounded-[8px] bg-[#6D5DFB] flex items-center justify-center text-white font-bold text-xs shadow-[inset_1px_1px_2px_rgba(0,0,0,0.20)]">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[#17181C] max-w-[100px] truncate">
                {displayName}
              </span>
            </div>
          }
          items={profileMenuItems}
        />
      </div>
    </header>
  );
};
