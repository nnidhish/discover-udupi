'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (!pwd) return 0;
  const types = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((r) => r.test(pwd)).length;
  if (pwd.length >= 8 && types >= 3) return 3;
  if (pwd.length >= 8 && types >= 2) return 2;
  return 1;
}

const strengthConfig = [
  { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' },
  { label: 'Fair', color: 'bg-amber-400', textColor: 'text-amber-600' },
  { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' },
];

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

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (isAuthenticated && !loading) router.push('/');
  }, [isAuthenticated, loading, router]);

  const strength = passwordStrength(password);

  const errors = {
    email: touched.email && !isValidEmail(email) ? 'Enter a valid email address' : '',
    password: touched.password && password.length < 6 ? 'Password must be at least 6 characters' : '',
    confirmPassword:
      touched.confirmPassword && confirmPassword !== password ? 'Passwords do not match' : '',
  };

  const touch = (field: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirmPassword: true });
    if (!isValidEmail(email) || password.length < 6 || password !== confirmPassword) return;

    setIsSubmitting(true);
    try {
      const { error } = await signUp(email, password, fullName);
      if (!error) {
        toast.success('Account created! Please check your email to confirm.');
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (err) {
      console.error('Sign up error:', err);
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

      <div className="relative z-10 w-full max-w-md px-4 py-8">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
              <p className="text-sm text-gray-500">Join Discover Udupi and start exploring</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                  Full Name{' '}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <InputWrapper hasError={false}>
                  <User className="ml-3 w-4 h-4 shrink-0 text-gray-400 group-focus-within:text-amber-500 transition-colors duration-200 pointer-events-none" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="flex-1 h-12 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </InputWrapper>
              </div>

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
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <InputWrapper hasError={!!errors.password}>
                  <Lock className={iconClass(!!errors.password)} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => touch('password')}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
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

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="pt-0.5 pl-1">
                    <div className="flex gap-1.5 mb-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={[
                            'h-1 flex-1 rounded-full transition-all duration-300',
                            strength >= level ? strengthConfig[level - 1].color : 'bg-gray-200',
                          ].join(' ')}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strengthConfig[strength - 1]?.textColor ?? ''}`}>
                      {strengthConfig[strength - 1]?.label ?? ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <InputWrapper hasError={!!errors.confirmPassword}>
                  <Lock className={iconClass(!!errors.confirmPassword)} />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => touch('confirmPassword')}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="flex-1 h-12 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    className="mr-3 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </InputWrapper>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 pl-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full h-12 rounded-xl text-sm font-semibold gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                  Sign in
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
