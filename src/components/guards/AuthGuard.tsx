/**
 * AuthGuard
 * Protects routes from unauthenticated users
 * Redirects to login if not authenticated
 */

import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuthState, useAuthInit } from '../../hooks/useAuth';
import { PageLoader } from '@/components/ui/PageLoader';

interface AuthGuardProps {
  children: ReactNode;
}

const LoadingSpinner = () => <PageLoader />;

/**
 * AuthGuard component
 * Wraps protected routes and ensures user is authenticated
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  // Initialize auth state on first render
  const { isLoading } = useAuthInit();
  const { isAuthenticated, isInitialized } = useAuthState();

  // Show loading spinner while checking auth
  if (isLoading || !isInitialized) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default AuthGuard;
