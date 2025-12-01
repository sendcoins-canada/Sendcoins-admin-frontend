import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Filter, ExportSquare, ArrowRight2, RecordCircle, ArrowDown2 } from 'iconsax-react';

export default function Transactions() {
  const transactions = useSelector((state: RootState) => state.transactions.items);

  return (
    <DashboardLayout title="Transactions">
      {/* Tabs & Filters */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1">
          <div className="flex gap-8">
            {['All', 'Incoming', 'Outgoing', 'Conversions'].map((tab, i) => (
              <button 
                key={tab}
                className={`pb-3 text-sm font-medium relative ${i === 0 ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
                {i === 0 && <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">5</span>}
                {i === 0 && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-600" />}
              </button>
            ))}
             <button className="pb-3 text-sm font-medium text-blue-600 flex items-center gap-1">
               +
             </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition-colors">
            <Filter size="16" />
            Filter
          </button>
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
            <div className="text-2xl font-bold">12,380</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border border-green-500 rounded-sm" />
              Completed
            </div>
            <div className="text-2xl font-bold">12,380</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border border-yellow-500 rounded-sm" />
              Pending transactions
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">3,000</span>
              <span className="text-xs text-green-500 font-medium">+3.5%</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border border-red-500 rounded-sm" />
              Failed transactions
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">3,000</span>
              <span className="text-xs text-green-500 font-medium">+3.5%</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-medium tracking-wider">
              <tr>
                <th className="px-6 py-4">TX ID</th>
                <th className="px-6 py-4">Date Initiated</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Currency</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{tx.txId}</td>
                  <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1 w-fit text-xs">
                      <ExportSquare size="12" />
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
                    <div className="font-medium">{tx.amount}</div>
                    <div className="text-xs text-gray-400">{tx.amountUsd}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'Completed' ? 'text-green-700 bg-green-50' : 
                      tx.status === 'Pending' ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50'
                    }`}>
                      {tx.status}
                      <ArrowDown2 size="10" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-[8px]">₿</div>
                      <div>
                        <div className="font-medium text-xs">{tx.source.address}</div>
                        <div className="text-[10px] text-gray-400">{tx.source.network}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[8px]">🏦</div>
                      <div>
                        <div className="font-medium text-xs">{tx.destination.name}</div>
                        <div className="text-[10px] text-gray-400">{tx.destination.account}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tx.fee}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                      <RecordCircle size="16" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
