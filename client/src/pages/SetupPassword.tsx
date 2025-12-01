import React, { useState } from 'react';
import { Eye, EyeSlash, TickCircle } from 'iconsax-react';
import { Link } from 'wouter';

export default function SetupPassword() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="mb-12 flex items-center gap-2">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        <span className="text-xl font-bold font-serif">SendCoins</span>
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-3xl">
            🔐
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup your password</h1>
          <p className="text-gray-500">Create a strong password so only you<br/>can access your account</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">
              ⌨
            </div>
            <input 
              type={showPassword ? "text" : "password"}
              className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="••••••••"
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeSlash size="20"/> : <Eye size="20"/>}
            </button>
          </div>

          <div className="space-y-3">
            {[
              "Must be at least 8 Char",
              "A mix of uppercase and lowercase letters",
              "At least one number",
              "A symbol (like ! or @)"
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <TickCircle size="12" variant="Bold" className="text-purple-600" />
                </div>
                <span>{req}</span>
              </div>
            ))}
          </div>

          <Link href="/confirm-password">
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
              Create password
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
