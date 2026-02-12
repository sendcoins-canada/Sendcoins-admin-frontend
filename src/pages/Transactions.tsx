import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTransactions, useTransactionStats, useExportTransactions } from '@/hooks/useTransactions';
import { useDebounce } from '@/hooks/useDebounce';
import { TransactionDetailModal } from '@/components/modals/TransactionDetailModal';
import {
  Filter,
  ArrowDown2,
  RecordCircle,
  Refresh,
  SearchNormal1,
  DocumentDownload,
  ArrowUp,
  ArrowDown,
  ArrowSwapHorizontal,
} from 'iconsax-react';
import type { TransactionType, TransactionStatus, TransactionFilters } from '@/types/transaction';

// =============================================================================
// Constants
// =============================================================================

const TABS = [
  { key: 'all', label: 'All', type: undefined },
  { key: 'incoming', label: 'Incoming', type: 'INCOMING' as TransactionType },
  { key: 'outgoing', label: 'Outgoing', type: 'OUTGOING' as TransactionType },
  { key: 'conversions', label: 'Conversions', type: 'CONVERSION' as TransactionType },
];

const STATUS_COLORS: Record<TransactionStatus, { bg: string; text: string }> = {
  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700' },
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  PROCESSING: { bg: 'bg-blue-50', text: 'text-blue-700' },
  FAILED: { bg: 'bg-red-50', text: 'text-red-700' },
  CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-700' },
  FLAGGED: { bg: 'bg-orange-50', text: 'text-orange-700' },
};

const TYPE_ICONS: Record<TransactionType, React.ReactNode> = {
  INCOMING: <ArrowDown size="12" />,
  OUTGOING: <ArrowUp size="12" />,
  CONVERSION: <ArrowSwapHorizontal size="12" />,
  BUY: <ArrowDown size="12" />,
  SELL: <ArrowUp size="12" />,
  TRANSFER: <ArrowSwapHorizontal size="12" />,
};

// =============================================================================
// Helper Functions
// =============================================================================

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const truncateAddress = (address?: string) => {
  if (!address) return 'N/A';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// =============================================================================
// Transactions Page Component
// =============================================================================

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Build filters based on active tab and search
  const filters: TransactionFilters = {
    ...(activeTab !== 'all' && { type: TABS.find(t => t.key === activeTab)?.type }),
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  // Fetch transactions with React Query
  const {
    data: transactionsData,
    isLoading,
    isFetching,
    refetch,
  } = useTransactions({ ...filters, page, limit: 20 });

  // Fetch stats
  const { data: stats } = useTransactionStats();

  // Export mutation
  const exportMutation = useExportTransactions();

  const transactions = transactionsData?.data ?? [];
  const pagination = transactionsData?.pagination;

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  return (
    <DashboardLayout title="Transactions">
      <div className="flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-1">
          <div className="flex gap-8">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
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
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <SearchNormal1 size="16" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
              />
            </div>

            <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition-colors">
              <Filter size="16" />
              Filter
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Refresh size="16" className={isFetching ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <DocumentDownload size="16" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-8 py-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border border-blue-500 rounded-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-sm" />
              </div>
              Total volume
            </div>
            <div className="text-2xl font-bold">
              {/* {stats?.total?.toLocaleString() ?? '-'} */}
              $5,249,725
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border border-green-500 rounded-sm" />
              Completed
            </div>
            <div className="text-2xl font-bold">
              {/* {stats?.completed?.toLocaleString() ?? '-'} */}
              128
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border border-yellow-500 rounded-sm" />
              Pending
            </div>
            <div className="text-2xl font-bold">
              {stats?.pending?.toLocaleString() ?? '-'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border border-red-500 rounded-sm" />
              Failed
            </div>
            <div className="text-2xl font-bold">
              {/* {stats?.failed?.toLocaleString() ?? '-'} */}
              77
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Refresh className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No transactions found
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-medium tracking-wider">
                <tr>
                  <th className="px-6 py-4">TX ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Currency</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Fee</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTransactionId(tx.id)}
                    className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                      tx.isFlagged ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {tx.txId}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatDate(tx.initiatedAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1 w-fit text-xs">
                        {TYPE_ICONS[tx.type]}
                        {tx.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] text-white font-bold">
                          {tx.currency[0]}
                        </div>
                        {tx.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{formatAmount(tx.amount, tx.currency)}</div>
                      <div className="text-xs text-gray-400">
                        {formatUsd(tx.amountUsd)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[tx.status]?.bg ?? 'bg-gray-50'
                        } ${STATUS_COLORS[tx.status]?.text ?? 'text-gray-700'}`}
                      >
                        {tx.status}
                        <ArrowDown2 size="10" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <div className="font-medium">{tx.userName}</div>
                        <div className="text-gray-400">{tx.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-[8px]">
                          {tx.source.type === 'WALLET' ? '₿' : '🏦'}
                        </div>
                        <div>
                          <div className="font-medium text-xs">
                            {tx.source.name ?? truncateAddress(tx.source.address)}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {tx.source.network ?? tx.source.bankName ?? '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[8px]">
                          {tx.destination.type === 'WALLET' ? '₿' : '🏦'}
                        </div>
                        <div>
                          <div className="font-medium text-xs">
                            {tx.destination.name ?? truncateAddress(tx.destination.address)}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {tx.destination.network ?? tx.destination.bankName ?? '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {formatAmount(tx.fee, tx.currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                        <RecordCircle size="16" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * pagination.limit + 1} to{' '}
              {Math.min(page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransactionId && (
        <TransactionDetailModal
          transactionId={selectedTransactionId}
          open={!!selectedTransactionId}
          onOpenChange={(open) => {
            if (!open) setSelectedTransactionId(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
