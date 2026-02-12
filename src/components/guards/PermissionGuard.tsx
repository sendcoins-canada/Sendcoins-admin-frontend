/**
 * PermissionGuard
 * Protects routes based on user permissions
 * Shows access denied if user lacks required permissions
 */

import { ReactNode } from 'react';
import { useAppSelector, selectHasPermission, selectHasAnyPermission, selectHasAllPermissions } from '../../store';
import type { Permission } from '../../types/auth';

interface PermissionGuardProps {
  children: ReactNode;
  /** Single permission to check */
  permission?: Permission;
  /** Multiple permissions - user needs at least one */
  anyOf?: Permission[];
  /** Multiple permissions - user needs all of them */
  allOf?: Permission[];
  /** Custom fallback component when access is denied */
  fallback?: ReactNode;
  /** If true, hide content instead of showing fallback (useful for UI elements) */
  hide?: boolean;
}

/**
 * Default Access Denied component
 */
const AccessDenied = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
      <p className="text-muted-foreground max-w-md">
        You don't have permission to access this page. Please contact your administrator
        if you believe this is an error.
      </p>
    </div>
  </div>
);

/**
 * PermissionGuard component
 * Protects content based on user permissions
 *
 * @example
 * // Single permission
 * <PermissionGuard permission="users:read">
 *   <UsersPage />
 * </PermissionGuard>
 *
 * @example
 * // Any of multiple permissions
 * <PermissionGuard anyOf={['users:read', 'users:write']}>
 *   <UsersPage />
 * </PermissionGuard>
 *
 * @example
 * // All of multiple permissions
 * <PermissionGuard allOf={['users:read', 'users:write']}>
 *   <UsersPage />
 * </PermissionGuard>
 *
 * @example
 * // Hide instead of showing fallback
 * <PermissionGuard permission="users:delete" hide>
 *   <DeleteButton />
 * </PermissionGuard>
 */
export const PermissionGuard = ({
  children,
  permission,
  anyOf,
  allOf,
  fallback,
  hide = false,
}: PermissionGuardProps) => {
  // Check single permission
  const hasSinglePermission = permission
    ? useAppSelector(selectHasPermission(permission))
    : true;

  // Check any of permissions
  const hasAnyPermission = anyOf
    ? useAppSelector(selectHasAnyPermission(anyOf))
    : true;

  // Check all of permissions
  const hasAllPermission = allOf
    ? useAppSelector(selectHasAllPermissions(allOf))
    : true;

  // User has access if all conditions pass
  const hasAccess = hasSinglePermission && hasAnyPermission && hasAllPermission;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Hide content if hide prop is true
  if (hide) {
    return null;
  }

  // Show fallback or default access denied
  return <>{fallback ?? <AccessDenied />}</>;
};

/**
 * Hook version for programmatic permission checks
 */
export const usePermissionGuard = (config: {
  permission?: Permission;
  anyOf?: Permission[];
  allOf?: Permission[];
}): boolean => {
  const { permission, anyOf, allOf } = config;

  const hasSinglePermission = permission
    ? useAppSelector(selectHasPermission(permission))
    : true;

  const hasAnyPermission = anyOf
    ? useAppSelector(selectHasAnyPermission(anyOf))
    : true;

  const hasAllPermission = allOf
    ? useAppSelector(selectHasAllPermissions(allOf))
    : true;

  return hasSinglePermission && hasAnyPermission && hasAllPermission;
};

export default PermissionGuard;
