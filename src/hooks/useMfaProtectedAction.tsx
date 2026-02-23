import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { setMfaActionToken, clearMfaActionToken } from '@/lib/api';

// =============================================================================
// Types
// =============================================================================

export interface MfaProtectedActionConfig {
  actionName: string;
  actionDescription?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface MfaProtectedActionResult<T> {
  // State
  isMfaModalOpen: boolean;
  isLoading: boolean;
  error: Error | null;

  // Modal control
  openMfaModal: () => void;
  closeMfaModal: () => void;

  // Action handling
  executeWithMfa: (action: (actionToken?: string) => Promise<T>) => Promise<T | undefined>;
  handleMfaVerified: (actionToken: string) => void;

  // Config for modal
  modalConfig: {
    actionName: string;
    actionDescription: string;
  };

  // MFA status
  mfaEnabled: boolean;
  mfaRequired: boolean;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useMfaProtectedAction<T = void>(
  config: MfaProtectedActionConfig
): MfaProtectedActionResult<T> {
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pendingAction, setPendingAction] = useState<((actionToken?: string) => Promise<T>) | null>(null);

  // Fetch MFA status
  const { data: mfaStatus } = useQuery({
    queryKey: ['mfaStatus'],
    queryFn: () => authService.getMfaStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const mfaEnabled = mfaStatus?.mfaEnabled ?? false;
  const mfaRequired = mfaStatus?.mfaRequired ?? false;

  const openMfaModal = useCallback(() => {
    setIsMfaModalOpen(true);
    setError(null);
  }, []);

  const closeMfaModal = useCallback(() => {
    setIsMfaModalOpen(false);
    setPendingAction(null);
    setError(null);
  }, []);

  const executeWithMfa = useCallback(
    async (action: (actionToken?: string) => Promise<T>): Promise<T | undefined> => {
      setError(null);

      // If MFA is not enabled, execute action directly
      if (!mfaEnabled) {
        setIsLoading(true);
        try {
          const result = await action();
          config.onSuccess?.();
          return result;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Action failed');
          setError(error);
          config.onError?.(error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      }

      // MFA is enabled - store the action and open the modal
      setPendingAction(() => action);
      setIsMfaModalOpen(true);
      return undefined;
    },
    [mfaEnabled, config]
  );

  const handleMfaVerified = useCallback(
    async (actionToken: string) => {
      if (!pendingAction) return;

      setIsLoading(true);
      setError(null);

      // Set the MFA action token so it's included in API requests
      setMfaActionToken(actionToken);

      try {
        const result = await pendingAction(actionToken);
        config.onSuccess?.();
        closeMfaModal();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Action failed');
        setError(error);
        config.onError?.(error);
        closeMfaModal();
        throw error;
      } finally {
        setIsLoading(false);
        // Clear the MFA action token after the action completes
        clearMfaActionToken();
      }
    },
    [pendingAction, config, closeMfaModal]
  );

  return {
    isMfaModalOpen,
    isLoading,
    error,
    openMfaModal,
    closeMfaModal,
    executeWithMfa,
    handleMfaVerified,
    modalConfig: {
      actionName: config.actionName,
      actionDescription: config.actionDescription || `This action requires MFA verification to proceed.`,
    },
    mfaEnabled,
    mfaRequired,
  };
}

// =============================================================================
// Convenience Hook for Simple Actions
// =============================================================================

export interface UseMfaActionOptions<T, TArgs extends unknown[]> {
  actionName: string;
  actionDescription?: string;
  mutationFn: (actionToken: string | undefined, ...args: TArgs) => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
}

export function useMfaAction<T, TArgs extends unknown[]>(
  options: UseMfaActionOptions<T, TArgs>
) {
  const mfa = useMfaProtectedAction<T>({
    actionName: options.actionName,
    actionDescription: options.actionDescription,
    onSuccess: () => {},
    onError: options.onError,
  });

  const execute = useCallback(
    async (...args: TArgs) => {
      return mfa.executeWithMfa(async (actionToken) => {
        const result = await options.mutationFn(actionToken, ...args);
        options.onSuccess?.(result);
        return result;
      });
    },
    [mfa, options]
  );

  return {
    ...mfa,
    execute,
  };
}

export default useMfaProtectedAction;
