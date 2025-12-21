import React, { useState, useEffect } from 'react';
import { Landing } from './views/Landing';
import { Dashboard } from './views/Dashboard';
import { ExamRunner } from './views/ExamRunner';
import { Profile } from './views/Profile';
import { EditProfile } from './views/EditProfile';
import { Subscription } from './views/Subscription';
import { Layout } from './components/Layout';
import { AuthModal } from './components/AuthModal';
import { SeriesSelection } from './views/SeriesSelection';
import { ResultsView as Results } from './views/Results';
import { Correction } from './views/Correction';
import { AllPlans } from './views/AllPlans';
import { ContactSales } from './views/ContactSales';
import { VerifyEmail } from './views/VerifyEmail';
import { ResetPassword } from './views/ResetPassword';
import { CheckEmail } from './views/CheckEmail';
import { HistoryPage } from './views/HistoryPage';
import { AttemptDetail } from './views/AttemptDetail';
import { Checkout } from './views/Checkout';
import { MOCK_READING_QUESTIONS, MOCK_LISTENING_QUESTIONS, WRITING_PROMPTS } from './constants';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { ModuleType, Question } from './types';
import { ThemeProvider } from './context/ThemeContext';

type SpecialRoute =
  | { type: 'verify-email'; token: string }
  | { type: 'reset-password'; token: string; email: string }
  | null;

const parseUrlParams = (): SpecialRoute => {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  const pathname = window.location.pathname;

  // Check for verify-email (supports /verify-email?token=xxx format)
  if (pathname.includes('/verify-email') || hash.includes('verify-email')) {
    const token = urlParams.get('token') ||
                  hash.replace('#/verify-email/', '').split('?')[0] ||
                  pathname.split('/verify-email/')[1];
    if (token) {
      return { type: 'verify-email', token };
    }
  }

  // Check for reset-password
  if (pathname.includes('/reset-password') || hash.includes('reset-password')) {
    const token = urlParams.get('token') || '';
    const email = urlParams.get('email') || '';
    if (token && email) {
      return { type: 'reset-password', token, email };
    }
  }

  return null;
};

const clearUrlParams = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

const AppContent = () => {
  const { view, activeModule, activeSeriesId, isAuthModalOpen, selectSeries, user, pendingVerificationEmail, clearPendingEmail } = useAppStore();
  const { initialize, isInitialized, isAuthenticated } = useAuthStore();
  const [specialRoute, setSpecialRoute] = useState<SpecialRoute>(null);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
    setSpecialRoute(parseUrlParams());
  }, [initialize]);

  const handleSpecialRouteComplete = () => {
    setSpecialRoute(null);
    clearUrlParams();
  };

  // Handle special routes (verify-email, reset-password)
  if (specialRoute) {
    if (specialRoute.type === 'verify-email') {
      return (
        <Layout>
          <VerifyEmail token={specialRoute.token} onComplete={handleSpecialRouteComplete} />
        </Layout>
      );
    }
    if (specialRoute.type === 'reset-password') {
      return (
        <Layout>
          <ResetPassword
            token={specialRoute.token}
            email={specialRoute.email}
            onComplete={handleSpecialRouteComplete}
          />
        </Layout>
      );
    }
  }

  // Show loading while initializing auth
  if (!isInitialized) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-10 w-10 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-slate-400">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSeriesSelect = (seriesId: number) => {
      selectSeries(seriesId);
  };

  // Protected views that require authentication
  const protectedViews = ['DASHBOARD', 'EXAM_RUNNER', 'PROFILE', 'EDIT_PROFILE', 'SUBSCRIPTION', 'RESULTS', 'SERIES_SELECTION', 'CORRECTION', 'HISTORY', 'ATTEMPT_DETAIL', 'CHECKOUT'];
  const isProtectedView = protectedViews.includes(view);

  // Redirect to landing if trying to access protected view without auth
  if (isProtectedView && !isAuthenticated && !user) {
    return (
      <Layout>
        <Landing />
        {isAuthModalOpen && <AuthModal />}
      </Layout>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'LANDING': return <Landing />;
      case 'DASHBOARD': return <Dashboard onStartExam={() => {}} />;
      case 'SERIES_SELECTION': return <SeriesSelection onSelectSeries={handleSeriesSelect} />;
      case 'EXAM_RUNNER':
        return activeModule && activeSeriesId
            ? <ExamRunner />
            : <Dashboard onStartExam={() => {}} />;
      case 'RESULTS': return <Results />;
      case 'CORRECTION': return <Correction />;
      case 'PROFILE': return <Profile />;
      case 'EDIT_PROFILE': return <EditProfile />;
      case 'SUBSCRIPTION': return <Subscription />;
      case 'ALL_PLANS': return <AllPlans />;
      case 'CONTACT_SALES': return <ContactSales />;
      case 'CHECK_EMAIL':
        return pendingVerificationEmail
          ? <CheckEmail email={pendingVerificationEmail} onBack={clearPendingEmail} />
          : <Landing />;
      case 'HISTORY': return <HistoryPage />;
      case 'ATTEMPT_DETAIL': return <AttemptDetail />;
      case 'CHECKOUT': return <Checkout />;
      default: return <Landing />;
    }
  };

  return (
    <Layout>
      {renderView()}
      {isAuthModalOpen && <AuthModal />}
    </Layout>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
