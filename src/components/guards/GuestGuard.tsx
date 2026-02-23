/**
 * GuestGuard
 * Protects routes from authenticated users
 * Redirects to dashboard if already authenticated
 */

import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuthState, useAuthInit } from '../../hooks/useAuth';
import { PageLoader } from '@/components/ui/PageLoader';

interface GuestGuardProps {
  children: ReactNode;
}

const LoadingSpinner = () => <PageLoader />;

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
