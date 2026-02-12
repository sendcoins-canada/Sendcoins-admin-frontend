import React from 'react';
import { useLocation, Link } from 'wouter';
import {
  Ghost,
  People,
  Bank,
  Wallet,
  Profile2User,
  LogoutCurve,
  SearchNormal1,
  ArrowDown2,
  DocumentText,
} from 'iconsax-react';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { useAuth, useAuthState } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { logout, isLoggingOut } = useAuth();
  const { user } = useAuthState();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'AD';
  };

  const navItems = [
    { icon: Ghost, path: '/dashboard', label: 'Home', hasNotification: true },
    { icon: People, path: '/users', label: 'Users' },
    { icon: Bank, path: '/partners', label: 'Partner Accounts' },
    { icon: Wallet, path: '/transactions', label: 'Transactions' },
    { icon: Profile2User, path: '/manage-team', label: 'Manage Team' },
    { icon: DocumentText, path: '/audit-logs', label: 'Audit Logs' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-6 fixed h-full z-10">
        <div className="mb-12">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-8 w-full items-center">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`p-3 rounded-xl transition-all duration-200 group relative block ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <item.icon size="24" variant={isActive ? "Bold" : "Linear"} color="currentColor" />
                  {item.hasNotification && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full -ml-3" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-3 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Logout"
          >
            <LogoutCurve size="24" color="currentColor" />
          </button>
        </div>
      </aside>


      {/* Main Content */}
      <main className="flex-1 ml-20 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

          <div className="flex items-center gap-6 flex-1 justify-end">
            <div className="max-w-md w-full relative hidden md:block">
              <SearchNormal1 size="20" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search across transactions, users, customers" 
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
              <NotificationsDropdown />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold text-sm">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</div>
                  <div className="text-xs text-gray-500">{user?.roleName || 'Administrator'}</div>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-50 rounded-full">
                <ArrowDown2 size="16" className="text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 bg-white flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
