import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  FileSpreadsheet,
  Layers,
  History,
  Settings,
  User,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { path, navigate } = useRouter();
  const { collections } = useData();

  const activeCol =
    collections.find((c) => c.status === 'Completed' || (c.recordCount || 0) > 0) ||
    collections[0];
  const resultsDestination = activeCol ? `/results/${activeCol.id}` : '/collections';

  const navItems = [
    { id: 'nav-dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { id: 'nav-new', label: 'New Collection', path: '/collections/new', icon: PlusCircle },
    { id: 'nav-collections', label: 'Collections', path: '/collections', icon: FolderKanban },
    { id: 'nav-results', label: 'Results', path: resultsDestination, icon: FileSpreadsheet, matchPrefix: '/results' },
    { id: 'nav-sources', label: 'Sources', path: '/sources', icon: Layers },
    { id: 'nav-history', label: 'History', path: '/history', icon: History },
  ];

  const bottomItems = [
    { id: 'nav-settings', label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNav = (targetPath: string) => {
    navigate(targetPath);
    onClose();
  };

  const isActive = (itemPath: string, matchPrefix?: string) => {
    if (matchPrefix) {
      return path.startsWith(matchPrefix);
    }
    if (itemPath === '/collections') {
      return path === '/collections' || (path.startsWith('/collections/') && path !== '/collections/new');
    }
    return path === itemPath;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#F4F5F7] flex flex-col justify-between p-4 transition-transform duration-250 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-[4px_0_18px_rgba(163,170,181,0.18)] border-r border-[rgba(20,24,32,0.06)]`}
      >
        <div>
          {/* Top Brand */}
          <div className="flex items-center justify-between px-3 py-3 mb-6">
            <button
              onClick={() => handleNav('/dashboard')}
              className="flex items-center gap-2.5 text-left focus-visible:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-[10px] bg-[#F8F9FB] flex items-center justify-center text-[#6D5DFB] shadow-[4px_4px_10px_rgba(163,170,181,0.25),-4px_-4px_10px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)] font-semibold text-base">
                ✦
              </div>
              <span className="font-bold text-base tracking-tight text-[#17181C]">
                Seekora AI
              </span>
            </button>
            <button
              onClick={onClose}
              className="lg:hidden text-[#646974] hover:text-[#17181C] p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2" aria-label="Main Navigation">
            {navItems.map(item => {
              const active = isActive(item.path, item.matchPrefix);
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-180 relative cursor-pointer ${
                    active
                      ? 'bg-[#F8F9FB] text-[#17181C] shadow-[4px_4px_12px_rgba(163,170,181,0.25),-4px_-4px_12px_rgba(255,255,255,0.95)] border border-[#6D5DFB]/15'
                      : 'text-[#646974] hover:text-[#17181C] hover:bg-[#EEF0F3]/60'
                  }`}
                >
                  {/* Purple Accent Indicator */}
                  {active && (
                    <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 bg-[#6D5DFB] rounded-full shadow-[0_0_8px_rgba(109,93,251,0.5)]" />
                  )}
                  <Icon
                    size={17}
                    className={active ? 'text-[#6D5DFB]' : 'text-[#9297A1]'}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-[rgba(20,24,32,0.06)] space-y-2">
          {bottomItems.map(item => {
            const active = path === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-180 relative cursor-pointer ${
                  active
                    ? 'bg-[#F8F9FB] text-[#17181C] shadow-[4px_4px_12px_rgba(163,170,181,0.25),-4px_-4px_12px_rgba(255,255,255,0.95)] border border-[#6D5DFB]/15'
                    : 'text-[#646974] hover:text-[#17181C] hover:bg-[#EEF0F3]/60'
                }`}
              >
                {active && (
                  <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 bg-[#6D5DFB] rounded-full shadow-[0_0_8px_rgba(109,93,251,0.5)]" />
                )}
                <Icon
                  size={17}
                  className={active ? 'text-[#6D5DFB]' : 'text-[#9297A1]'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Profile Quick Item */}
          <button
            type="button"
            onClick={() => handleNav('/settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] bg-[#F8F9FB] shadow-[4px_4px_10px_rgba(163,170,181,0.20),-4px_-4px_10px_rgba(255,255,255,0.95)] hover:shadow-[5px_5px_12px_rgba(163,170,181,0.25)] border border-[rgba(20,24,32,0.04)] mt-2 text-left cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-[#6D5DFB] flex items-center justify-center text-white font-bold text-xs shadow-[inset_1px_1px_2px_rgba(0,0,0,0.20)] shrink-0">
              <User size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#17181C] truncate">Settings & Profile</p>
              <p className="text-[11px] text-[#9297A1] truncate">Account Security</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
