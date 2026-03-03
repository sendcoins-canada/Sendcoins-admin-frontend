/**
 * Can – conditionally render content based on permission.
 * Use to hide buttons, menu items, or sections the user is not allowed to use.
 */

import { ReactNode } from 'react';
import { useAppSelector, selectHasPermission, selectHasAnyPermission, selectHasAllPermissions } from '@/store';
import type { Permission } from '@/types/auth';

export interface CanProps {
  children: ReactNode;
  /** Single permission required */
  permission?: Permission;
  /** User needs at least one of these */
  anyOf?: Permission[];
  /** User needs all of these */
  allOf?: Permission[];
}

/**
 * Renders children only if the user has the required permission(s). Otherwise renders null.
 */
export function Can({ children, permission, anyOf, allOf }: CanProps) {
  const hasSingle = permission ? useAppSelector(selectHasPermission(permission)) : true;
  const hasAny = anyOf ? useAppSelector(selectHasAnyPermission(anyOf)) : true;
  const hasAll = allOf ? useAppSelector(selectHasAllPermissions(allOf)) : true;
  const can = hasSingle && hasAny && hasAll;

  if (can) {
    return <>{children}</>;
  }
  return null;
}

export default Can;
