/**
 * GuestGuard
 * Protects routes from authenticated users
 * Redirects to dashboard if already authenticated
 */

import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuthState, useAuthInit } from '../../hooks/useAuth';

interface GuestGuardProps {
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
 * GuestGuard component
 * Wraps guest-only routes (login, forgot password, etc.)
 * Redirects authenticated users to dashboard
 */
export const GuestGuard = ({ children }: GuestGuardProps) => {
  // Initialize auth state on first render
  const { isLoading } = useAuthInit();
  const { isAuthenticated, isInitialized, requiresMfa } = useAuthState();

  // Show loading spinner while checking auth
  if (isLoading || !isInitialized) {
    return <LoadingSpinner />;
  }

  // Allow access if MFA is required (user is in MFA flow)
  if (requiresMfa) {
    return <>{children}</>;
  }

  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  // User is not authenticated, render children
  return <>{children}</>;
};

export default GuestGuard;
