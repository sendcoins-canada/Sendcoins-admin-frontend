import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { analyticsService } from '@/services/analyticsService';
import { Refresh, Chart2, DocumentDownload, TrendUp, TrendDown, People, ArrowSwapHorizontal, DollarCircle } from 'iconsax-react';
import { TableLoader } from '@/components/ui/TableLoader';
import { TableEmpty } from '@/components/ui/TableEmpty';

type GroupBy = 'day' | 'week' | 'month';

export default function Analytics() {
  const [groupBy, setGroupBy] = useState<GroupBy>('month');
  const [dateRange, setDateRange] = useState('30'); // days

  const { data: txAnalytics, isLoading: txLoading, refetch: refetchTx, isFetching: fetchingTx } = useQuery({
    queryKey: queryKeys.analytics.transactions({ groupBy, dateRange }),
    queryFn: () => analyticsService.getTransactionAnalytics({ groupBy, dateRange }),
  });

  const { data: userAnalytics, isLoading: userLoading, refetch: refetchUser, isFetching: fetchingUser } = useQuery({
    queryKey: queryKeys.analytics.users({ groupBy, dateRange }),
    queryFn: () => analyticsService.getUserAnalytics({ groupBy, dateRange }),
  });

  const { data: revenueAnalytics, isLoading: revenueLoading, refetch: refetchRevenue, isFetching: fetchingRevenue } = useQuery({
    queryKey: queryKeys.analytics.revenue({ groupBy, dateRange }),
    queryFn: () => analyticsService.getRevenueAnalytics({ groupBy, dateRange }),
  });

  const { data: topUsers, isLoading: topLoading } = useQuery({
    queryKey: queryKeys.analytics.topUsers({ limit: 10 }),
    queryFn: () => analyticsService.getTopUsers({ limit: 10 }),
  });

  const isLoading = txLoading || userLoading || revenueLoading;
  const isFetching = fetchingTx || fetchingUser || fetchingRevenue;

  const refetchAll = () => {
    refetchTx();
    refetchUser();
    refetchRevenue();
  };

  // Parse analytics data safely
  const txData = txAnalytics as Record<string, unknown> | undefined;
  const userData = userAnalytics as Record<string, unknown> | undefined;
  const revData = revenueAnalytics as Record<string, unknown> | undefined;
  const topList = Array.isArray(topUsers) ? topUsers : [];

  // Extract user analytics arrays
  const registrations = Array.isArray(userData?.registrations) 
    ? userData.registrations as Array<{ period: string; count: number }>
    : [];
  const byCountry = Array.isArray(userData?.byCountry)
    ? userData.byCountry as Array<{ country: string; count: number }>
    : [];
  const byVerification = Array.isArray(userData?.byVerification)
    ? userData.byVerification as Array<{ status: string; count: number }>
    : [];

  // Extract summary values
  const totalTransactions = Number(txData?.total ?? txData?.totalTransactions ?? 0);
  const totalVolume = Number(txData?.volume ?? txData?.totalVolume ?? 0);
  const totalUsers = registrations.reduce((sum, r) => sum + r.count, 0) || 
                     Number(userData?.total ?? userData?.totalUsers ?? 0);
  const newUsers = registrations.length > 0 
    ? registrations[registrations.length - 1]?.count || 0
    : Number(userData?.new ?? userData?.newUsers ?? 0);
  const totalRevenue = Number(revData?.total ?? revData?.totalRevenue ?? 0);

  return (
    <DashboardLayout title="Analytics">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Group By Selector */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refetchAll}
            disabled={isFetching}
            className="p-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Refresh size={18} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition-colors">
            <DocumentDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white min-h-[256px]">
          <TableLoader />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Transactions */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ArrowSwapHorizontal size={20} className="text-blue-600" />
                </div>
                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <TrendUp size={14} />
                  +12%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total Transactions</p>
            </div>

            {/* Total Volume */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarCircle size={20} className="text-green-600" />
                </div>
                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <TrendUp size={14} />
                  +8%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total Volume</p>
            </div>

            {/* Total Users */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <People size={20} className="text-purple-600" />
                </div>
                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <TrendUp size={14} />
                  +{newUsers}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total Users</p>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Chart2 size={20} className="text-yellow-600" />
                </div>
                <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                  <TrendDown size={14} />
                  -3%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Transaction Analytics */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <ArrowSwapHorizontal size={18} className="text-blue-600" />
                Transaction Analytics
              </h3>
              <div className="space-y-3">
                {txData && typeof txData === 'object' && Object.entries(txData).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium text-gray-900">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Analytics */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <People size={18} className="text-purple-600" />
                User Analytics
              </h3>
              <div className="space-y-4">
                {/* Registrations */}
                {registrations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Registrations</h4>
                    <div className="space-y-2">
                      {registrations.slice(0, 5).map((reg, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{reg.period}</span>
                          <span className="font-medium text-gray-900">{reg.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* By Country */}
                {byCountry.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">By Country</h4>
                    <div className="space-y-2">
                      {byCountry.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.country}</span>
                          <span className="font-medium text-gray-900">{item.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* By Verification */}
                {byVerification.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">By Verification</h4>
                    <div className="space-y-2">
                      {byVerification.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 capitalize">{item.status}</span>
                          <span className="font-medium text-gray-900">{item.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {registrations.length === 0 && byCountry.length === 0 && byVerification.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">No data available</div>
                )}
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarCircle size={18} className="text-green-600" />
                Revenue Analytics
              </h3>
              <div className="space-y-4">
                {revData?.message ? (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    {String(revData.message)}
                  </div>
                ) : (
                  <>
                    {/* Time Series */}
                    {Array.isArray(revData?.timeSeries) && revData.timeSeries.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Time Series</h4>
                        <div className="space-y-2">
                          {(revData.timeSeries as Array<{ period: string; revenue: string | number; expenses?: string | number }>)
                            .slice(0, 5)
                            .map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{item.period}</span>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-green-600">
                                    ${Number(item.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
                                  {item.expenses !== undefined && (
                                    <span className="text-xs text-gray-500">
                                      (Exp: ${Number(item.expenses).toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* By Category */}
                    {Array.isArray(revData?.byCategory) && revData.byCategory.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">By Category</h4>
                        <div className="space-y-2">
                          {(revData.byCategory as Array<{ category: string; amount: string | number }>)
                            .slice(0, 5)
                            .map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 capitalize">{item.category}</span>
                                <span className="font-medium text-gray-900">
                                  ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {(!Array.isArray(revData?.timeSeries) || revData.timeSeries.length === 0) &&
                     (!Array.isArray(revData?.byCategory) || revData.byCategory.length === 0) && (
                      <div className="text-sm text-gray-500 text-center py-4">No data available</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Top Users by Volume</h3>
              <span className="text-xs text-gray-500">Last {dateRange} days</span>
            </div>
            {topLoading ? (
              <TableLoader />
            ) : topList.length === 0 ? (
              <TableEmpty message="No data available" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-medium tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4">#</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Transactions</th>
                      <th className="text-left py-3 px-4">Volume</th>
                      <th className="text-left py-3 px-4">Country</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topList.map((u: Record<string, unknown>, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {String(u.name ?? u.fullName ?? 'Unknown')}
                            </div>
                            <div className="text-xs text-gray-500">{String(u.email ?? '-')}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {Number(u.transactionCount ?? 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          ${Number(u.totalVolume ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {String(u.country ?? '-')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
