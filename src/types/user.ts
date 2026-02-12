/**
 * User Types
 * Types related to platform users (customers)
 */

// =============================================================================
// Enums
// =============================================================================

/**
 * KYC verification status
 */
export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

/**
 * User account status
 */
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';

/**
 * User account type
 */
export type AccountType = 'PERSONAL' | 'BUSINESS';

// =============================================================================
// Platform User
// =============================================================================

/**
 * Platform user (customer) - list view
 */
export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  country: string;
  accountType: AccountType;
  kycStatus: KycStatus;
  status: UserStatus;
  walletCount: number;
  totalBalance: number;
  transactionCount: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Detailed user info (for user detail page)
 */
export interface UserDetail extends PlatformUser {
  // Additional details
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;

  // KYC info
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  kycRejectionReason?: string;

  // Security
  mfaEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;

  // Wallets
  wallets: UserWallet[];

  // Bank accounts
  bankAccounts: UserBankAccount[];

  // Admin notes
  adminNotes?: string;
}

// =============================================================================
// User Wallet
// =============================================================================

/**
 * User wallet summary
 */
export interface UserWallet {
  id: string;
  currency: string;
  network: string;
  address: string;
  balance: number;
  balanceUsd: number;
  isFrozen: boolean;
}

// =============================================================================
// User Bank Account
// =============================================================================

/**
 * User bank account
 */
export interface UserBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  isVerified: boolean;
}

// =============================================================================
// Filters & Stats
// =============================================================================

/**
 * User filters for list view
 */
export interface UserFilters {
  search?: string;
  status?: UserStatus;
  kycStatus?: KycStatus;
  accountType?: AccountType;
  country?: string;
  dateFrom?: string;
  dateTo?: string;
  minBalance?: number;
  maxBalance?: number;
  page?: number;
  limit?: number;
}

/**
 * User statistics
 */
export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  banned: number;
  pendingKyc: number;
  verifiedKyc: number;
}

// =============================================================================
// Activity & KYC
// =============================================================================

/**
 * User activity log entry
 */
export interface UserActivity {
  id: string;
  type: 'LOGIN' | 'LOGOUT' | 'TRANSACTION' | 'KYC_UPDATE' | 'PROFILE_UPDATE' | 'WALLET_ACTION' | 'SECURITY';
  action: string;
  description: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * KYC document
 */
export interface KycDocument {
  id: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
