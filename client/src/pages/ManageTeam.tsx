import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTeamMembers } from '@/store/slices/teamSlice';
import { Filter, Add, RecordCircle } from 'iconsax-react';
import { Loader2 } from 'lucide-react';

export default function ManageTeam() {
  const dispatch = useDispatch<AppDispatch>();
  const { members: team, isLoading } = useSelector((state: RootState) => state.team);

  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);

  return (
    <DashboardLayout title="Manage Team">
      {/* Tabs */}
      <div className="border-b border-gray-100 mb-6">
        <div className="flex gap-8">
          <button className="pb-3 text-sm font-medium text-gray-900 relative">
            Team members
            <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">5</span>
            <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-600" />
          </button>
          <button className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 relative">
            Roles
            <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">2</span>
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition-colors">
            <Filter size="16" />
            Filter
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center">1</span>
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            Users includes
            <div className="flex -space-x-2">
              {team.slice(0, 3).map(m => (
                <img key={m.id} src={m.avatar} className="w-5 h-5 rounded-full border border-white" alt="" />
              ))}
              <div className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[10px] font-medium text-gray-600">
                +5
              </div>
            </div>
          </div>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
          <Add size="16" />
          New user
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-medium tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {team.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={member.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-blue-600 font-medium text-xs">
                        <div className="w-4 h-4 rounded-full border border-blue-200 flex items-center justify-center text-[8px]">👤</div>
                        {member.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.department}</td>
                    <td className="px-6 py-4 text-gray-600">{member.lastActive}</td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-green-700 bg-green-50">
                        {member.status}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
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
            
            <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
              <div>Page 1 of 5</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
