'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const emailError = touched && !isValidEmail(email) ? 'Enter a valid email address' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidEmail(email)) return;

    setIsSubmitting(true);
    const { error } = await resetPassword(email);
    setIsSubmitting(false);
    if (!error) setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 animate-gradient-shift" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400/30 rounded-full blur-3xl animate-float-1" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/25 rounded-full blur-3xl animate-float-2" />
      </div>
      <div className="absolute inset-0 bg-black/15" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #FBBF24, #F59E0B, #0891B2)' }} />

          <div className="p-8">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot your password?</h1>
              <p className="text-sm text-gray-500">Enter your email and we&apos;ll send you a reset link.</p>
            </div>

            {sent ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-14 h-14 text-green-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your inbox</h2>
                <p className="text-sm text-gray-500 mb-2">
                  We sent a reset link to{' '}
                  <span className="font-medium text-gray-900">{email}</span>.
                </p>
                <p className="text-xs text-gray-400">Didn&apos;t receive it? Check your spam folder.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email address
                  </label>
                  <div
                    className={[
                      'group flex items-center rounded-xl border-2 transition-all duration-200',
                      emailError
                        ? 'border-red-300 bg-red-50/40 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-50'
                        : 'border-gray-200 bg-gray-50 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-100',
                    ].join(' ')}
                  >
                    <Mail className={[
                      'ml-3 w-4 h-4 shrink-0 pointer-events-none transition-colors duration-200',
                      emailError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-amber-500',
                    ].join(' ')} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="flex-1 h-12 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 pl-1">{emailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl text-sm font-semibold gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link href="/auth/signin" className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors">
                ← Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
