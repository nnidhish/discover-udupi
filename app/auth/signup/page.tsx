'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    router.push('/');
    return null;
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, fullName);
      if (!error) {
        toast.success('Account created! Please check your email to confirm your account.');
        // Wait a bit then redirect
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient-shift"></div>
      
      {/* Floating animated orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-float-1"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-float-2"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-400/30 rounded-full blur-3xl animate-float-3"></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-float-4"></div>
      </div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-2xl">U</span>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join Discover Udupi and start exploring</p>
          </div>



          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

