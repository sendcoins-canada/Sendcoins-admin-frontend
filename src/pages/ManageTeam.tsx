import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  useTeamMembers,
  useRoles,
  useDepartments,
  useSuspendMember,
  useActivateMember,
} from '@/hooks/useTeam';
import { useDebounce } from '@/hooks/useDebounce';
import { InviteTeamMemberModal } from '@/components/modals/InviteTeamMemberModal';
import { CreateRoleModal } from '@/components/modals/CreateRoleModal';
import {
  Filter,
  Add,
  RecordCircle,
  Refresh,
  SearchNormal1,
  ShieldTick,
  UserRemove,
  UserTick,
  ArrowDown2,
} from 'iconsax-react';
import type { AdminStatus } from '@/types/auth';
import type { TeamFilters } from '@/types/team';

// =============================================================================
// Constants
// =============================================================================

const TABS = [
  { key: 'members', label: 'Team members' },
  { key: 'roles', label: 'Roles' },
];

const STATUS_COLORS: Record<AdminStatus, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-green-50', text: 'text-green-700' },
  SUSPENDED: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  LOCKED: { bg: 'bg-orange-50', text: 'text-orange-700' },
  DELETED: { bg: 'bg-red-50', text: 'text-red-700' },
};

// =============================================================================
// Helper Functions
// =============================================================================

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// =============================================================================
// Manage Team Page Component
// =============================================================================

export default function ManageTeam() {
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Build filters based on search
  const filters: TeamFilters = {
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  // Fetch team members with React Query
  const {
    data: membersData,
    isLoading: membersLoading,
    isFetching: membersFetching,
    refetch: refetchMembers,
  } = useTeamMembers({ ...filters, page, limit: 20 });

  // Fetch roles
  const {
    data: rolesData,
    isLoading: rolesLoading,
    isFetching: rolesFetching,
    refetch: refetchRoles,
  } = useRoles();

  // Fetch departments for filter dropdown
  const { data: departmentsData } = useDepartments();

  // Mutations
  const suspendMutation = useSuspendMember();
  const activateMutation = useActivateMember();

  const members = membersData?.data ?? [];
  const membersPagination = membersData?.pagination;
  const roles = rolesData?.data ?? [];

  const isLoading = activeTab === 'members' ? membersLoading : rolesLoading;
  const isFetching = activeTab === 'members' ? membersFetching : rolesFetching;

  const handleSuspend = (id: string) => {
    if (confirm('Are you sure you want to suspend this team member?')) {
      suspendMutation.mutate({ id, reason: 'Suspended by admin' });
    }
  };

  const handleActivate = (id: string) => {
    activateMutation.mutate(id);
  };

  const handleRefresh = () => {
    if (activeTab === 'members') {
      refetchMembers();
    } else {
      refetchRoles();
    }
  };

  return (
    <DashboardLayout title="Manage Team">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-1 mb-6">
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
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                {tab.key === 'members' ? members.length : roles.length}
              </span>
              {activeTab === tab.key && (
                <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <SearchNormal1 size="16" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'members' ? 'Search members...' : 'Search roles...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
            />
          </div>

          <button className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition-colors">
            <Filter size="16" />
            Filter
          </button>

          {activeTab === 'members' && members.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              Members
              <div className="flex -space-x-2">
                {members.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className={`w-5 h-5 rounded-full ${
                      m.avatar ? '' : getAvatarColor(m.fullName)
                    } border border-white flex items-center justify-center text-[8px] text-white font-medium`}
                  >
                    {m.avatar ? (
                      <img src={m.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      getInitials(m.firstName, m.lastName)
                    )}
                  </div>
                ))}
                {members.length > 3 && (
                  <div className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[10px] font-medium text-gray-600">
                    +{members.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Refresh size="16" className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              if (activeTab === 'members') {
                setShowInviteModal(true);
              } else {
                setShowRoleModal(true);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            <Add size="16" />
            {activeTab === 'members' ? 'Invite member' : 'Create role'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Refresh className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : activeTab === 'members' ? (
          /* Team Members Table */
          members.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No team members found
            </div>
          ) : (
            <>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-medium tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">MFA</th>
                    <th className="px-6 py-4">Last Active</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-full ${getAvatarColor(
                                member.fullName
                              )} flex items-center justify-center text-white text-sm font-medium`}
                            >
                              {getInitials(member.firstName, member.lastName)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-blue-600 font-medium text-xs">
                          <div className="w-4 h-4 rounded-full border border-blue-200 flex items-center justify-center text-[8px]">
                            👤
                          </div>
                          {member.roleName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {member.departmentName ?? '-'}
                      </td>
                      <td className="px-6 py-4">
                        {member.mfaEnabled ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <ShieldTick size="14" variant="Bold" />
                            <span className="text-xs">Enabled</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Disabled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {formatDate(member.lastActive)}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[member.status]?.bg ?? 'bg-gray-50'
                          } ${STATUS_COLORS[member.status]?.text ?? 'text-gray-700'}`}
                        >
                          {member.status}
                          <ArrowDown2 size="10" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {member.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleSuspend(member.id)}
                              disabled={suspendMutation.isPending}
                              className="p-1.5 hover:bg-yellow-50 rounded-lg text-yellow-600 transition-colors"
                              title="Suspend member"
                            >
                              <UserRemove size="16" />
                            </button>
                          ) : member.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => handleActivate(member.id)}
                              disabled={activateMutation.isPending}
                              className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                              title="Activate member"
                            >
                              <UserTick size="16" />
                            </button>
                          ) : null}
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                            <RecordCircle size="16" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {membersPagination && (
                <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Showing {(page - 1) * membersPagination.limit + 1} to{' '}
                    {Math.min(page * membersPagination.limit, membersPagination.total)} of{' '}
                    {membersPagination.total} members
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(membersPagination.totalPages, p + 1))}
                      disabled={page === membersPagination.totalPages}
                      className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          /* Roles Table */
          roles.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No roles found
            </div>
          ) : (
            <>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-medium tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Role Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Permissions</th>
                    <th className="px-6 py-4">Members</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <ShieldTick size="16" variant="Bold" />
                          </div>
                          <span className="font-medium text-gray-900">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {role.description ?? '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((perm) => (
                            <span
                              key={perm}
                              className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600"
                            >
                              {perm.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          {role.memberCount} members
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {role.isSystem ? (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                            System
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                            Custom
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {formatDate(role.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                          disabled={role.isSystem}
                        >
                          <RecordCircle size="16" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )
        )}
      </div>

      {/* Invite Team Member Modal */}
      <InviteTeamMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onSuccess={() => refetchMembers()}
      />

      {/* Create Role Modal */}
      <CreateRoleModal
        open={showRoleModal}
        onOpenChange={setShowRoleModal}
        onSuccess={() => refetchRoles()}
      />
    </DashboardLayout>
  );
}
