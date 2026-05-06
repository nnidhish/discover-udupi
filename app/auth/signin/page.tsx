'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function InputWrapper({ hasError, children }: { hasError: boolean; children: React.ReactNode }) {
  return (
    <div
      className={[
        'group flex items-center rounded-xl border-2 transition-all duration-200',
        hasError
          ? 'border-red-300 bg-red-50/40 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-50'
          : 'border-gray-200 bg-gray-50 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-100',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    if (isAuthenticated && !loading) router.push('/');
  }, [isAuthenticated, loading, router]);

  const errors = {
    email: touched.email && !isValidEmail(email) ? 'Enter a valid email address' : '',
    password: touched.password && !password ? 'Password is required' : '',
  };

  const touch = (field: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValidEmail(email) || !password) return;

    setLoginError('');
    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setLoginError('Incorrect email or password. Please try again.');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const iconClass = (hasError: boolean) =>
    [
      'ml-3 w-4 h-4 shrink-0 pointer-events-none transition-colors duration-200',
      hasError
        ? 'text-red-400'
        : 'text-gray-400 group-focus-within:text-amber-500',
    ].join(' ');

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 animate-gradient-shift" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400/30 rounded-full blur-3xl animate-float-1" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/25 rounded-full blur-3xl animate-float-2" />
      </div>
      <div className="absolute inset-0 bg-black/15" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Card with amber top accent */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #FBBF24, #F59E0B, #0891B2)' }} />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #D97706 100%)',
                    boxShadow: '0 4px 12px rgba(180,83,9,0.35)',
                  }}
                >
                  <span className="font-bold text-xl" style={{ color: '#451a03' }}>U</span>
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-sm text-gray-500">Sign in to continue exploring Udupi</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email address
                </label>
                <InputWrapper hasError={!!errors.email}>
                  <Mail className={iconClass(!!errors.email)} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => touch('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="flex-1 h-12 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </InputWrapper>
                {errors.email && (
                  <p className="text-xs text-red-500 pl-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <InputWrapper hasError={!!errors.password}>
                  <Lock className={iconClass(!!errors.password)} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => touch('password')}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="flex-1 h-12 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="mr-3 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </InputWrapper>
                {errors.password && (
                  <p className="text-xs text-red-500 pl-1">{errors.password}</p>
                )}
              </div>

              {/* Server error */}
              {loginError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full h-12 rounded-xl text-sm font-semibold gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                  Create one
                </Link>
              </p>
              <Link href="/" className="block text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
