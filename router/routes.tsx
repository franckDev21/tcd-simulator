import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Views
import { Landing } from '../views/Landing';
import { Dashboard } from '../views/Dashboard';
import { ExamRunner } from '../views/ExamRunner';
import { Profile } from '../views/Profile';
import { EditProfile } from '../views/EditProfile';
import { Subscription } from '../views/Subscription';
import { SeriesSelection } from '../views/SeriesSelection';
import { ResultsView as Results } from '../views/Results';
import { Correction } from '../views/Correction';
import { AllPlans } from '../views/AllPlans';
import { ContactSales } from '../views/ContactSales';
import { VerifyEmail } from '../views/VerifyEmail';
import { ResetPassword } from '../views/ResetPassword';
import { CheckEmail } from '../views/CheckEmail';
import { HistoryPage } from '../views/HistoryPage';
import { AttemptDetail } from '../views/AttemptDetail';
import { Checkout } from '../views/Checkout';
import { PaymentResult } from '../views/PaymentResult';
import { FlaggedQuestions } from '../views/FlaggedQuestions';
import { WritingChoice } from '../views/WritingChoice';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public routes
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'plans',
        element: <AllPlans />,
      },
      {
        path: 'contact',
        element: <ContactSales />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmail />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'check-email',
        element: <CheckEmail />,
      },

      // Protected routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/edit',
        element: (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'subscription',
        element: (
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        ),
      },
      {
        path: 'exam/:module/series',
        element: (
          <ProtectedRoute>
            <SeriesSelection />
          </ProtectedRoute>
        ),
      },
      {
        path: 'exam/:module/series/:seriesId',
        element: (
          <ProtectedRoute>
            <ExamRunner />
          </ProtectedRoute>
        ),
      },
      {
        path: 'exam/results',
        element: (
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        ),
      },
      {
        path: 'exam/correction',
        element: (
          <ProtectedRoute>
            <Correction />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history/:attemptId',
        element: (
          <ProtectedRoute>
            <AttemptDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout/:planId',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/result',
        element: (
          <ProtectedRoute>
            <PaymentResult />
          </ProtectedRoute>
        ),
      },
      {
        path: 'review',
        element: (
          <ProtectedRoute>
            <FlaggedQuestions />
          </ProtectedRoute>
        ),
      },
      {
        path: 'exam/writing/choice',
        element: (
          <ProtectedRoute>
            <WritingChoice />
          </ProtectedRoute>
        ),
      },

      // Catch-all redirect
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

// Route paths constants for type-safe navigation
export const ROUTES = {
  HOME: '/',
  PLANS: '/plans',
  CONTACT: '/contact',
  VERIFY_EMAIL: '/verify-email',
  RESET_PASSWORD: '/reset-password',
  CHECK_EMAIL: '/check-email',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  SUBSCRIPTION: '/subscription',
  SERIES_SELECTION: (module: string) => `/exam/${encodeURIComponent(module)}/series`,
  EXAM: (module: string, seriesId: number) => `/exam/${encodeURIComponent(module)}/series/${seriesId}`,
  RESULTS: '/exam/results',
  CORRECTION: '/exam/correction',
  HISTORY: '/history',
  ATTEMPT_DETAIL: (attemptId: number) => `/history/${attemptId}`,
  CHECKOUT: (planId: number) => `/checkout/${planId}`,
  PAYMENT_RESULT: '/payment/result',
  FLAGGED_QUESTIONS: '/review',
  WRITING_CHOICE: '/exam/writing/choice',
} as const;
