import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { NewCollectionPage } from './pages/NewCollectionPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { ResultsPage } from './pages/ResultsPage';
import { SourcesPage } from './pages/SourcesPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';

const AppContent: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  // Route protection logic (Section 8 & 9)
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = path === '/signin' || path === '/signup';

    if (!isAuthenticated && !isPublicRoute) {
      navigate('/signin');
    } else if (isAuthenticated && isPublicRoute) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, path, navigate]);

  // Loading state while verifying auth session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-6">
        <div className="bg-[#F8F9FB] rounded-[20px] p-8 shadow-[8px_8px_18px_rgba(163,170,181,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)] text-center space-y-3 max-w-sm w-full">
          <div className="w-8 h-8 rounded-full border-2 border-[#E4E7EC] border-t-[#6D5DFB] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#646974]">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Standalone public auth routes
  if (path === '/signin') {
    return <SignInPage />;
  }
  if (path === '/signup') {
    return <SignUpPage />;
  }

  // If not authenticated, do not expose private views
  if (!isAuthenticated) {
    return <SignInPage />;
  }

  // Protected application routes
  let content: React.ReactNode;

  if (path === '/' || path === '/dashboard') {
    content = <DashboardPage />;
  } else if (path === '/collections/new') {
    content = <NewCollectionPage />;
  } else if (path === '/collections') {
    content = <CollectionsPage />;
  } else if (path.startsWith('/collections/')) {
    const id = path.replace('/collections/', '');
    content = <CollectionDetailPage id={id} />;
  } else if (path.startsWith('/results/')) {
    const id = path.replace('/results/', '');
    content = <ResultsPage id={id} />;
  } else if (path === '/sources') {
    content = <SourcesPage />;
  } else if (path === '/history') {
    content = <HistoryPage />;
  } else if (path === '/settings') {
    content = <SettingsPage />;
  } else {
    content = <DashboardPage />;
  }

  return <AppLayout>{content}</AppLayout>;
};

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
