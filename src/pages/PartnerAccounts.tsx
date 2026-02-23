import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TableEmpty } from '@/components/ui/TableEmpty';
import { Bank } from 'iconsax-react';

export default function PartnerAccounts() {
  return (
    <DashboardLayout title="Partner receiving accounts">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white min-h-[256px] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Bank size={32} className="text-blue-600" />
          </div>
          <TableEmpty message="Partner Accounts is coming soon. This feature will allow you to manage partner receiving accounts." />
        </div>
      </div>
    </DashboardLayout>
  );
}
