import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/';

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  // Handle missing code
  if (!code) {
    console.error('No authorization code provided');
    return NextResponse.redirect(
      new URL('/?error=No authorization code provided', requestUrl.origin)
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Auth callback error:', exchangeError);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    // Verify session was created
    if (!data?.session) {
      console.error('No session created after code exchange');
      return NextResponse.redirect(
        new URL('/?error=Failed to create session', requestUrl.origin)
      );
    }

    // Successful authentication - redirect to home with success flag
    const redirectUrl = new URL(next, requestUrl.origin);
    redirectUrl.searchParams.set('auth', 'success');
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('Unexpected error in auth callback:', err);
    return NextResponse.redirect(
      new URL('/?error=An unexpected error occurred during authentication', requestUrl.origin)
    );
  }
}

