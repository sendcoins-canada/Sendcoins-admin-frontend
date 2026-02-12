import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useTransaction,
  useFlagTransaction,
  useUnflagTransaction,
  useApproveTransaction,
  useRejectTransaction,
} from '@/hooks/useTransactions';
import {
  Refresh,
  Copy,
  TickCircle,
  ArrowUp,
  ArrowDown,
  ArrowSwapHorizontal,
  Warning2,
  Flag,
  Flag2,
  TickSquare,
  CloseSquare,
  Export,
  Clock,
  Calendar,
  User,
  Wallet,
  Bank,
} from 'iconsax-react';
import type { TransactionType, TransactionStatus } from '@/types/transaction';

// =============================================================================
// Types
// =============================================================================

interface TransactionDetailModalProps {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// =============================================================================
// Constants
// =============================================================================

const STATUS_COLORS: Record<TransactionStatus, { bg: string; text: string }> = {
  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700' },
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  PROCESSING: { bg: 'bg-blue-50', text: 'text-blue-700' },
  FAILED: { bg: 'bg-red-50', text: 'text-red-700' },
  CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-700' },
  FLAGGED: { bg: 'bg-orange-50', text: 'text-orange-700' },
};

const TYPE_CONFIG: Record<TransactionType, { color: string; icon: React.ReactNode; label: string }> = {
  INCOMING: { color: 'text-green-600', icon: <ArrowDown size="16" />, label: 'Incoming' },
  OUTGOING: { color: 'text-red-600', icon: <ArrowUp size="16" />, label: 'Outgoing' },
  CONVERSION: { color: 'text-blue-600', icon: <ArrowSwapHorizontal size="16" />, label: 'Conversion' },
  BUY: { color: 'text-green-600', icon: <ArrowDown size="16" />, label: 'Buy' },
  SELL: { color: 'text-red-600', icon: <ArrowUp size="16" />, label: 'Sell' },
  TRANSFER: { color: 'text-purple-600', icon: <ArrowSwapHorizontal size="16" />, label: 'Transfer' },
};

// =============================================================================
// Helper Functions
// =============================================================================

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatAmount = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(amount) + ' ' + currency;
};

const formatUsd = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const truncateAddress = (address?: string, chars = 10) => {
  if (!address) return 'N/A';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// =============================================================================
// Info Row Component
// =============================================================================

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
}

const InfoRow = ({ icon, label, value, copyable }: InfoRowProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-900 font-medium">{value || 'N/A'}</div>
      </div>
      {copyable && typeof value === 'string' && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
        >
          {copied ? <TickCircle size="14" className="text-green-600" /> : <Copy size="14" />}
        </button>
      )}
    </div>
  );
};

// =============================================================================
// Endpoint Card Component
// =============================================================================

interface EndpointCardProps {
  title: string;
  endpoint: {
    type: 'WALLET' | 'BANK' | 'EXTERNAL';
    address?: string;
    network?: string;
    name?: string;
    bankName?: string;
    accountNumber?: string;
  };
}

const EndpointCard = ({ title, endpoint }: EndpointCardProps) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="text-xs text-gray-500 mb-2">{title}</div>
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          endpoint.type === 'WALLET' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
        }`}
      >
        {endpoint.type === 'WALLET' ? <Wallet size="18" /> : <Bank size="18" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {endpoint.name ?? truncateAddress(endpoint.address) ?? endpoint.bankName ?? 'Unknown'}
        </div>
        <div className="text-xs text-gray-500">
          {endpoint.type === 'WALLET'
            ? endpoint.network ?? 'Unknown network'
            : endpoint.accountNumber
            ? `****${endpoint.accountNumber.slice(-4)}`
            : 'Bank Account'}
        </div>
      </div>
    </div>
  </div>
);

// =============================================================================
// Transaction Detail Modal Component
// =============================================================================

export function TransactionDetailModal({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  // Fetch transaction data
  const { data: transaction, isLoading, refetch } = useTransaction(transactionId);

  // Mutations
  const flagMutation = useFlagTransaction();
  const unflagMutation = useUnflagTransaction();
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();

  const handleFlag = () => {
    const reason = prompt('Enter reason for flagging:');
    if (reason) {
      flagMutation.mutate({ id: transactionId, data: { reason } });
    }
  };

  const handleUnflag = () => {
    unflagMutation.mutate(transactionId);
  };

  const handleApprove = () => {
    const note = prompt('Enter approval note (optional):');
    approveMutation.mutate({ id: transactionId, note: note || undefined });
  };

  const handleReject = () => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      rejectMutation.mutate({ id: transactionId, reason });
    }
  };

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'history', label: 'History' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Refresh className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : transaction ? (
          <>
            {/* Header */}
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        TYPE_CONFIG[transaction.type]?.color ?? 'text-gray-600'
                      } bg-gray-100`}
                    >
                      {TYPE_CONFIG[transaction.type]?.icon}
                    </div>
                    <div>
                      <DialogTitle className="text-lg">
                        {TYPE_CONFIG[transaction.type]?.label ?? transaction.type} Transaction
                      </DialogTitle>
                      <div className="text-sm text-gray-500 font-mono">
                        {transaction.txId}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[transaction.status]?.bg ?? 'bg-gray-50'
                      } ${STATUS_COLORS[transaction.status]?.text ?? 'text-gray-700'}`}
                    >
                      {transaction.status}
                    </span>
                    {transaction.isFlagged && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        <Warning2 size="12" />
                        Flagged
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => refetch()}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                  >
                    <Refresh size="18" />
                  </button>
                </div>
              </div>
            </DialogHeader>

            {/* Amount Display */}
            <div className="py-4 border-b border-gray-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {formatAmount(transaction.amount, transaction.currency)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatUsd(transaction.amountUsd)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 py-3 border-b border-gray-100">
              {transaction.status === 'PENDING' && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700"
                  >
                    <TickSquare size="16" />
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-700"
                  >
                    <CloseSquare size="16" />
                    Reject
                  </button>
                </>
              )}
              {!transaction.isFlagged ? (
                <button
                  onClick={handleFlag}
                  disabled={flagMutation.isPending}
                  className="flex-1 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-orange-100"
                >
                  <Flag size="16" />
                  Flag
                </button>
              ) : (
                <button
                  onClick={handleUnflag}
                  disabled={unflagMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <Flag2 size="16" />
                  Unflag
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`pb-3 text-sm font-medium relative ${
                    activeTab === tab.key
                      ? 'text-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Source & Destination */}
                  <div className="grid grid-cols-2 gap-4">
                    <EndpointCard title="Source" endpoint={transaction.source} />
                    <EndpointCard title="Destination" endpoint={transaction.destination} />
                  </div>

                  {/* Transaction Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Transaction Info</h3>
                      <InfoRow
                        icon={<Clock size="16" />}
                        label="Initiated"
                        value={formatDateTime(transaction.initiatedAt)}
                      />
                      {transaction.completedAt && (
                        <InfoRow
                          icon={<TickCircle size="16" />}
                          label="Completed"
                          value={formatDateTime(transaction.completedAt)}
                        />
                      )}
                      <InfoRow
                        icon={<Wallet size="16" />}
                        label="Fee"
                        value={`${formatAmount(transaction.fee, transaction.currency)} (${formatUsd(transaction.feeUsd)})`}
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">User Info</h3>
                      <InfoRow
                        icon={<User size="16" />}
                        label="User"
                        value={transaction.userName}
                      />
                      <InfoRow
                        icon={<User size="16" />}
                        label="Email"
                        value={transaction.userEmail}
                        copyable
                      />
                      <InfoRow
                        icon={<User size="16" />}
                        label="User ID"
                        value={transaction.userId}
                        copyable
                      />
                    </div>
                  </div>

                  {/* Blockchain Info */}
                  {transaction.txHash && (
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Blockchain Info</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Transaction Hash</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-gray-900">
                              {truncateAddress(transaction.txHash, 12)}
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(transaction.txHash!)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy size="14" className="text-gray-400" />
                            </button>
                            <a
                              href="#"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Export size="14" className="text-gray-400" />
                            </a>
                          </div>
                        </div>
                        {transaction.blockNumber && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Block Number</span>
                            <span className="text-sm font-medium text-gray-900">
                              {transaction.blockNumber.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {transaction.confirmations !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Confirmations</span>
                            <span className="text-sm font-medium text-gray-900">
                              {transaction.confirmations}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Flag Info */}
                  {transaction.isFlagged && transaction.flagReason && (
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-orange-700 mb-2">
                        <Warning2 size="16" />
                        <span className="text-sm font-medium">Flagged Transaction</span>
                      </div>
                      <div className="text-sm text-orange-600">{transaction.flagReason}</div>
                      {transaction.flaggedBy && (
                        <div className="text-xs text-orange-500 mt-2">
                          Flagged by {transaction.flaggedBy} on {formatDateTime(transaction.flaggedAt)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  {transaction.history && transaction.history.length > 0 ? (
                    transaction.history.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            STATUS_COLORS[item.status]?.bg ?? 'bg-gray-100'
                          } ${STATUS_COLORS[item.status]?.text ?? 'text-gray-600'}`}
                        >
                          <Clock size="14" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{item.action}</div>
                          <div className="text-xs text-gray-500">
                            by {item.performedByName} on {formatDateTime(item.timestamp)}
                          </div>
                          {item.note && (
                            <div className="text-sm text-gray-600 mt-1">{item.note}</div>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            STATUS_COLORS[item.status]?.bg ?? 'bg-gray-100'
                          } ${STATUS_COLORS[item.status]?.text ?? 'text-gray-600'}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">No history available</div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Transaction not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TransactionDetailModal;
