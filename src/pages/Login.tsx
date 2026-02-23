import React, { useState } from 'react';
import { Eye, EyeSlash, Sms, Refresh, Lock, ShieldTick } from 'iconsax-react';
import { Link } from 'wouter';
import { AppLogo } from '@/components/ui/AppLogo';
import { useAuth, useAuthState } from '@/hooks/useAuth';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// =============================================================================
// Login Form Component
// =============================================================================

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  error: string | null;
}

const LoginForm = ({ onSubmit, isLoading, error }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: (values) => {
      onSubmit(values.email, values.password);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Email Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
            <Sms size="20" variant="Bold" />
          </div>
          <input
            id="email"
            type="email"
            {...formik.getFieldProps('email')}
            className={`w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
              formik.touched.email && formik.errors.email
                ? 'border border-red-500'
                : ''
            }`}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="text-red-500 text-xs mt-1 ml-1">
              {formik.errors.email}
            </div>
          ) : null}
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
            <Lock size="20" variant="Bold" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...formik.getFieldProps('password')}
            className={`w-full pl-12 pr-12 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
              formik.touched.password && formik.errors.password
                ? 'border border-red-500'
                : ''
            }`}
            placeholder="Enter your password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
          >
            {showPassword ? (
              <EyeSlash size="20" variant="Bold" />
            ) : (
              <Eye size="20" variant="Bold" />
            )}
          </button>
          {formik.touched.password && formik.errors.password ? (
            <div className="text-red-500 text-xs mt-1 ml-1">
              {formik.errors.password}
            </div>
          ) : null}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-600">Remember for 30 days</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-blue-600 font-medium hover:text-blue-700"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Refresh className="w-5 h-5 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </button>

      {/* Sign Up Link */}
      <div className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link
          href="/setup-password"
          className="text-blue-600 font-medium hover:text-blue-700"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
};

// =============================================================================
// MFA Form Component
// =============================================================================

interface MfaFormProps {
  onSubmit: (code: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

const MfaForm = ({ onSubmit, onCancel, isLoading, error }: MfaFormProps) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onSubmit(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-gray-500">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {/* OTP Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
          <ShieldTick size="20" variant="Bold" />
        </div>
        <input
          type="text"
          value={code}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCode(value);
          }}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-center text-2xl tracking-[0.5em] font-mono"
          placeholder="000000"
          maxLength={6}
          autoFocus
          disabled={isLoading}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || code.length !== 6}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Refresh className="w-5 h-5 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify'
        )}
      </button>

      {/* Back Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="w-full py-4 text-gray-600 font-medium hover:text-gray-800 transition-all"
      >
        Back to login
      </button>
    </form>
  );
};

// =============================================================================
// Main Login Page Component
// =============================================================================

export default function Login() {
  const { login, verifyMfa, cancelMfa, isLoggingIn, isVerifyingMfa } = useAuth();
  const { requiresMfa, mfaToken, error } = useAuthState();

  const handleLogin = (email: string, password: string) => {
    login({ email, password });
  };

  const handleMfaVerify = (code: string) => {
    if (mfaToken) {
      verifyMfa({ mfaToken, code });
    }
  };

  const handleMfaCancel = () => {
    cancelMfa();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      {/* Logo */}
      <div className="mb-12">
        <AppLogo height={32} width={140} className="h-8 w-auto" />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-3xl">
            {requiresMfa ? '🔐' : '👋'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {requiresMfa ? 'Two-Factor Authentication' : 'Welcome back'}
          </h1>
          <p className="text-gray-500">
            {requiresMfa
              ? 'Verify your identity to continue'
              : 'Please enter your details to sign in.'}
          </p>
        </div>

        {/* Form */}
        {requiresMfa ? (
          <MfaForm
            onSubmit={handleMfaVerify}
            onCancel={handleMfaCancel}
            isLoading={isVerifyingMfa}
            error={error}
          />
        ) : (
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoggingIn}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
