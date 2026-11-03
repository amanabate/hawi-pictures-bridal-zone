'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { Sparkles, Lock, User, AlertCircle, Eye, EyeOff, Camera, Heart } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Image from 'next/image';

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(identifier, password);
      if (success) {
        router.push('/admin');
      } else {
        setError('Invalid credentials. Please check your username/email/phone and password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center overflow-hidden">
      <div className="w-full h-screen flex">
        {/* LEFT SIDE - Beautiful Bridal Photo */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[var(--gold)]/20 via-[var(--surface)] to-[var(--gold)]/10 overflow-hidden">
          {/* Overlay Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '32px 32px',
              color: 'var(--gold)'
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
            {/* Bridal Image Placeholder with Beautiful Frame */}
            <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-[var(--gold)]/30">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/30 to-transparent" />
              
              {/* Use a beautiful bridal image - replace with actual image */}
              <div className="w-full h-full bg-gradient-to-br from-amber-100 via-rose-100 to-amber-50 dark:from-amber-900/30 dark:via-rose-900/30 dark:to-amber-900/30 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center shadow-2xl">
                    <Camera className="w-16 h-16 text-white" />
                  </div>
                  <div className="px-8">
                    <h2 className="font-serif text-4xl font-bold text-[var(--text)] mb-3">
                      Hawi Pictures
                    </h2>
                    <p className="text-lg text-[var(--text-muted)] mb-2">
                      & Bridal Zone
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[var(--gold)]">
                      <Heart className="w-5 h-5 fill-current" />
                      <span className="text-sm font-semibold">Ethiopia's Premier Wedding Studio</span>
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[var(--gold)] rounded-tl-2xl opacity-50" />
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[var(--gold)] rounded-br-2xl opacity-50" />
            </div>

            {/* Studio Info */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-sm font-semibold text-[var(--text)]">
                  1,200+ Weddings Captured
                </span>
              </div>
            </div>
          </div>

          {/* Decorative Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--gold)]/10 to-transparent" />
        </div>

        {/* RIGHT SIDE - Login Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[var(--surface)]">
          <div className="w-full max-w-md">
            {/* Mobile Logo - Only shown on small screens */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-[var(--text)] mb-2">
                Hawi Admin
              </h1>
            </div>

            {/* Login Card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-8 sm:p-10">
              {/* Header */}
              <div className="mb-8">
                <div className="hidden lg:flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-[var(--text)]">
                      Admin Portal
                    </h1>
                    <p className="text-xs text-[var(--text-muted)]">
                      Hawi Pictures & Bridal Zone
                    </p>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-[var(--text)] mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Sign in to access the studio dashboard
                </p>
              </div>

              {/* Demo Credentials Info */}
              <div className="mb-6 p-3 bg-[var(--card-subtle)] border border-[var(--border)] rounded-xl">
                <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Demo Credentials:</p>
                <div className="text-xs text-[var(--text)] space-y-1">
                  <p><strong>Owner:</strong> admin / admin123</p>
                  <p><strong>Staff:</strong> receptionist / reception123</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username/Email/Phone Input */}
                <div>
                  <label htmlFor="identifier" className="block text-sm font-semibold text-[var(--text)] mb-2">
                    Username, Email, or Phone
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter username, email, or phone"
                      className="w-full pl-11 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition-all"
                      required
                      autoComplete="username"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[var(--text)] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-12 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition-all"
                      required
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-white text-base font-bold rounded-xl shadow-2xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-[var(--text-muted)]">
                  Hawi Pictures & Bridal Zone © 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
