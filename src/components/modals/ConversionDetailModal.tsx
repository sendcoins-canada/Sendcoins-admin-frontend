import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { conversionService } from '@/services/conversionService';
import {
  Refresh,
  ArrowSwapHorizontal,
  User,
  Bank,
  Calendar,
  TickCircle,
  CloseCircle,
  DollarCircle,
  Flag,
} from 'iconsax-react';
import { toast } from 'sonner';
import { MfaVerificationModal } from './MfaVerificationModal';
import { useMfaProtectedAction } from '@/hooks/useMfaProtectedAction';

// =============================================================================
// Types
// =============================================================================

interface ConversionDetailModalProps {
  conversionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAmount = (amount?: number | string, currency?: string) => {
  if (amount === undefined || amount === null) return 'N/A';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(num);
};

// =============================================================================
// Info Row Component
// =============================================================================

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-900 font-medium">{value || 'N/A'}</div>
      </div>
    </div>
  );
};

// =============================================================================
// Conversion Detail Modal Component
// =============================================================================

export function ConversionDetailModal({ conversionId, open, onOpenChange }: ConversionDetailModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch conversion details
  const { data: conversion, isLoading, refetch } = useQuery({
    queryKey: ['conversions', 'detail', conversionId],
    queryFn: () => conversionService.getOne(conversionId),
    enabled: !!conversionId && open,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => conversionService.approve(conversionId),
    onSuccess: () => {
      toast.success('Conversion approved successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.conversions.all });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve conversion');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => conversionService.reject(conversionId, reason),
    onSuccess: () => {
      toast.success('Conversion rejected');
      queryClient.invalidateQueries({ queryKey: queryKeys.conversions.all });
      setShowRejectForm(false);
      setRejectReason('');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject conversion');
    },
  });

  // MFA Protection for conversion approval
  const mfaApprove = useMfaProtectedAction({
    actionName: 'Approve Conversion',
    actionDescription: 'You are about to approve this conversion. This action requires MFA verification.',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversions.all });
    },
  });

  // MFA Protection for conversion rejection
  const mfaReject = useMfaProtectedAction({
    actionName: 'Reject Conversion',
    actionDescription: 'You are about to reject this conversion. This action requires MFA verification.',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversions.all });
    },
  });

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this conversion?')) {
      return;
    }

    await mfaApprove.executeWithMfa(async () => {
      await approveMutation.mutateAsync();
    });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const reason = rejectReason;
    await mfaReject.executeWithMfa(async () => {
      await rejectMutation.mutateAsync(reason);
    });
  };

  const handleMfaVerified = (actionToken: string) => {
    if (mfaApprove.isMfaModalOpen) {
      mfaApprove.handleMfaVerified(actionToken);
    } else if (mfaReject.isMfaModalOpen) {
      mfaReject.handleMfaVerified(actionToken);
    }
  };

  const isPending = conversion?.status === 'pending' || conversion?.status === 'locked';
  const statusColor =
    conversion?.status === 'completed' ? 'bg-green-50 text-green-700' :
    conversion?.status === 'pending' ? 'bg-amber-50 text-amber-700' :
    conversion?.status === 'locked' ? 'bg-blue-50 text-blue-700' :
    conversion?.status === 'failed' ? 'bg-red-50 text-red-700' :
    'bg-gray-50 text-gray-700';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Refresh className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : conversion ? (
          <>
            {/* Header */}
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <ArrowSwapHorizontal size={24} />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-lg">Conversion Details</DialogTitle>
                  <div className="text-sm text-gray-500 mt-0.5 font-mono">
                    {conversion.reference || `#${conversion.id}`}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {conversion.status || 'pending'}
                    </span>
                    {conversion.isFlagged && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                        <Flag size={12} />
                        Flagged
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => refetch()}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                  <Refresh size="18" />
                </button>
              </div>
            </DialogHeader>

            {/* Conversion Info */}
            <div className="py-4 space-y-4">
              {/* Amount Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Crypto Amount</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {conversion.cryptoAmount || conversion.amount || '-'} {conversion.cryptoCurrency || ''}
                    </div>
                  </div>
                  <ArrowSwapHorizontal size={20} className="text-gray-400" />
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Fiat Amount</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatAmount(conversion.fiatAmount || conversion.amount, conversion.fiatCurrency || conversion.currency)}
                    </div>
                  </div>
                </div>
                {conversion.exchangeRate && (
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Rate: 1 {conversion.cryptoCurrency || 'CRYPTO'} = {conversion.exchangeRate} {conversion.fiatCurrency || conversion.currency}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-900 mb-2">User Information</h3>
                <InfoRow
                  icon={<User size="16" />}
                  label="User"
                  value={conversion.userName || conversion.userEmail || `User ${conversion.userId}`}
                />
                {conversion.userEmail && (
                  <InfoRow
                    icon={<User size="16" />}
                    label="Email"
                    value={conversion.userEmail}
                  />
                )}
              </div>

              {/* Recipient Info */}
              <div className="space-y-1 border-t border-gray-100 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Recipient Details</h3>
                <InfoRow
                  icon={<User size="16" />}
                  label="Recipient Name"
                  value={conversion.recipientName}
                />
                <InfoRow
                  icon={<Bank size="16" />}
                  label="Bank"
                  value={conversion.bankName}
                />
                <InfoRow
                  icon={<DollarCircle size="16" />}
                  label="Account Number"
                  value={
                    <span className="font-mono">
                      {conversion.recipientAccountNumber || 'N/A'}
                    </span>
                  }
                />
                <InfoRow
                  icon={<DollarCircle size="16" />}
                  label="Destination"
                  value={`${conversion.destinationCountry || '-'} (${conversion.currency || conversion.fiatCurrency || '-'})`}
                />
              </div>

              {/* Timestamps */}
              <div className="space-y-1 border-t border-gray-100 pt-4">
                <InfoRow
                  icon={<Calendar size="16" />}
                  label="Created"
                  value={formatDate(conversion.createdAt)}
                />
                {conversion.completedAt && (
                  <InfoRow
                    icon={<Calendar size="16" />}
                    label="Completed"
                    value={formatDate(conversion.completedAt)}
                  />
                )}
                {conversion.fee !== undefined && (
                  <InfoRow
                    icon={<DollarCircle size="16" />}
                    label="Fee"
                    value={formatAmount(conversion.fee, conversion.fiatCurrency || conversion.currency)}
                  />
                )}
              </div>

              {/* Flag Reason */}
              {conversion.isFlagged && conversion.flagReason && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                  <div className="text-sm font-medium text-orange-700 mb-1">Flag Reason</div>
                  <div className="text-sm text-orange-600">{conversion.flagReason}</div>
                </div>
              )}
            </div>

            {/* Reject Form */}
            {showRejectForm && (
              <div className="border-t border-gray-100 pt-4">
                <label className="text-sm font-medium text-gray-700">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejectMutation.isPending || !rejectReason.trim()}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {rejectMutation.isPending ? (
                      <Refresh size="16" className="animate-spin" />
                    ) : (
                      <CloseCircle size="16" />
                    )}
                    Confirm Reject
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isPending && !showRejectForm && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <CloseCircle size="18" />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {approveMutation.isPending ? (
                    <Refresh size="18" className="animate-spin" />
                  ) : (
                    <TickCircle size="18" />
                  )}
                  Approve
                </button>
              </div>
            )}

            {/* Completed Status */}
            {conversion.status === 'completed' && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                  <TickCircle size="20" variant="Bold" />
                  <span className="text-sm font-medium">This conversion has been completed</span>
                </div>
              </div>
            )}

            {/* Failed Status */}
            {conversion.status === 'failed' && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                  <CloseCircle size="20" variant="Bold" />
                  <span className="text-sm font-medium">This conversion has failed</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500">
            Conversion not found
          </div>
        )}
      </DialogContent>

      {/* MFA Verification Modals */}
      <MfaVerificationModal
        open={mfaApprove.isMfaModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) mfaApprove.closeMfaModal();
        }}
        onVerified={handleMfaVerified}
        actionName={mfaApprove.modalConfig.actionName}
        actionDescription={mfaApprove.modalConfig.actionDescription}
      />

      <MfaVerificationModal
        open={mfaReject.isMfaModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) mfaReject.closeMfaModal();
        }}
        onVerified={handleMfaVerified}
        actionName={mfaReject.modalConfig.actionName}
        actionDescription={mfaReject.modalConfig.actionDescription}
      />
    </Dialog>
  );
}

export default ConversionDetailModal;
