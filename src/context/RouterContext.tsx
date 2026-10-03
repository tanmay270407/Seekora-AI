import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  path: '/dashboard',
  navigate: () => {},
  params: {},
});

// Helper to extract params like :id
export function matchRoute(pattern: string, pathname: string): { matched: boolean; params: Record<string, string> } {
  // Normalize trailing slash
  const normPattern = pattern === '/' ? '/' : pattern.replace(/\/+$/, '');
  const normPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

  const patternParts = normPattern.split('/').filter(Boolean);
  const pathParts = normPath.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { matched: false, params: {} };
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i];
    const pathPart = pathParts[i];

    if (pPart.startsWith(':')) {
      const key = pPart.slice(1);
      params[key] = decodeURIComponent(pathPart);
    } else if (pPart !== pathPart) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p === '/' ? '/dashboard' : p;
    }
    return '/dashboard';
  });

  const navigate = useCallback((to: string) => {
    const target = to === '/' ? '/dashboard' : to;
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', target);
      setPath(target);
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setPath(p === '/' ? '/dashboard' : p);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  const ctx = useContext(RouterContext);
  return ctx;
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, className = '', activeClassName = '', children, ...props }) => {
  const { path, navigate } = useRouter();
  const isActive = path === to || (to !== '/dashboard' && path.startsWith(to));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    navigate(to);
  };

  const finalClassName = `${className} ${isActive ? activeClassName : ''}`.trim();

  return (
    <a href={to} onClick={handleClick} className={finalClassName} {...props}>
      {children}
    </a>
  );
};
