import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Provider } from 'react-redux';
import { store } from './store';
import NotFound from '@/pages/not-found';

// Guards
import { AuthGuard, GuestGuard, PermissionGuard } from '@/components/guards';

// Auth pages
import Login from '@/pages/Login';
import SetupPassword from '@/pages/SetupPassword';
import ConfirmPassword from '@/pages/ConfirmPassword';

// Protected pages
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import ManageTeam from '@/pages/ManageTeam';
import Users from '@/pages/Users';
import PartnerAccounts from '@/pages/PartnerAccounts';
import AuditLogs from '@/pages/AuditLogs';

// =============================================================================
// Route Components with Guards
// =============================================================================

/**
 * Guest routes - only accessible when not authenticated
 */
const GuestRoutes = () => (
  <GuestGuard>
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/setup-password" component={SetupPassword} />
      <Route path="/confirm-password" component={ConfirmPassword} />
      <Route component={NotFound} />
    </Switch>
  </GuestGuard>
);

/**
 * Protected routes - only accessible when authenticated
 */
const ProtectedRoutes = () => (
  <AuthGuard>
    <Switch>
      {/* Dashboard */}
      <Route path="/dashboard">
        <PermissionGuard permission="VIEW_DASHBOARD">
          <Dashboard />
        </PermissionGuard>
      </Route>

      {/* Transactions - requires transaction permissions */}
      <Route path="/transactions">
        <PermissionGuard anyOf={['READ_TRANSACTIONS', 'VERIFY_TRANSACTIONS']}>
          <Transactions />
        </PermissionGuard>
      </Route>

      {/* Users - requires user permissions */}
      <Route path="/users">
        <PermissionGuard anyOf={['READ_USERS', 'SUSPEND_USERS', 'VERIFY_KYC']}>
          <Users />
        </PermissionGuard>
      </Route>

      {/* Team Management - requires team permissions */}
      <Route path="/team">
        <PermissionGuard permission="MANAGE_ADMINS">
          <ManageTeam />
        </PermissionGuard>
      </Route>
      <Route path="/manage-team">
        <PermissionGuard permission="MANAGE_ADMINS">
          <ManageTeam />
        </PermissionGuard>
      </Route>

      {/* Partner Accounts */}
      <Route path="/partners">
        <PermissionGuard permission="VIEW_ANALYTICS">
          <PartnerAccounts />
        </PermissionGuard>
      </Route>

      {/* Audit Logs */}
      <Route path="/audit-logs">
        <PermissionGuard permission="READ_AUDIT_LOGS">
          <AuditLogs />
        </PermissionGuard>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  </AuthGuard>
);

// =============================================================================
// Main Router
// =============================================================================

function Router() {
  return (
    <Switch>
      {/* Guest routes (login, setup password, etc.) */}
      <Route path="/" component={GuestRoutes} />
      <Route path="/login" component={GuestRoutes} />
      <Route path="/setup-password" component={GuestRoutes} />
      <Route path="/confirm-password" component={GuestRoutes} />

      {/* All other routes are protected */}
      <Route>
        <ProtectedRoutes />
      </Route>
    </Switch>
  );
}

// =============================================================================
// App Component
// =============================================================================

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
