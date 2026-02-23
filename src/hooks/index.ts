/**
 * Hooks Barrel Export
 * Re-exports all custom hooks
 */

// Auth hooks
export {
  useAuth,
  useAuthState,
  useAuthInit,
  usePermissions,
  useHasPermission,
  useChangePassword,
  useRequestPasswordReset,
  useResetPassword,
  useMfaSetup,
  useEnableMfa,
  useDisableMfa,
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
} from './useAuth';

// Transaction hooks
export {
  useTransactions,
  useTransaction,
  useTransactionStats,
  usePendingApprovals,
  useUserTransactions,
  useFlagTransaction,
  useUnflagTransaction,
  useApproveTransaction,
  useRejectTransaction,
  useExportTransactions,
} from './useTransactions';

// User hooks
export {
  useUsers,
  useUser,
  useUserStats,
  useUserKyc,
  useUserActivity,
  useUserLoginHistory,
  useUserNotes,
  useSuspendUser,
  useUnsuspendUser,
  useFreezeUser,
  useUnfreezeUser,
  useCloseAccount,
  useApproveKyc,
  useRejectKyc,
  useRequestKycDocuments,
  useAddUserNote,
  useExportUsers,
} from './useUsers';

// Team hooks
export {
  useTeamMembers,
  useTeamMember,
  useInviteAdmin,
  useUpdateMember,
  useSuspendMember,
  useActivateMember,
  useDeactivateMember,
  useDeleteMemberPermanently,
  useResendInvitation,
  useResetMemberMfa,
  useRoles,
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissions as useTeamPermissions,
  useDepartments,
  useDepartment,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from './useTeam';

// Notification hooks
export {
  useNotifications,
  useNotificationCounts,
  useNotificationPreferences,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
  useUpdateNotificationPreferences,
} from './useNotifications';

// Audit log hooks
export {
  useAuditLogs,
  useAuditLog,
  useAdminAuditLogs,
  useResourceAuditLogs,
  useExportAuditLogs,
} from './useAuditLogs';

// Platform hooks
export {
  usePlatformBalance,
  usePlatformRevenue,
  usePlatformStats,
  usePlatformSettings,
  useScheduledReports,
  useUpdatePlatformSettings,
  useEnableMaintenance,
  useDisableMaintenance,
  useTransferToColdWallet,
  useTransferToHotWallet,
  useWithdrawFees,
  useGenerateReport,
  useCreateScheduledReport,
  useDeleteScheduledReport,
} from './usePlatform';

// Toast hook (existing)
export { useToast } from './use-toast';
