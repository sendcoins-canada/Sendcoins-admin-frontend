/**
 * AuthGuard
 * Protects routes from unauthenticated users
 * Redirects to login if not authenticated
 */

import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuthState, useAuthInit } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Loading spinner component
 */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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
