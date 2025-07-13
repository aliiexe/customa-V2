import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes, Clerk assets, and auth flows
  const url = req.nextUrl.pathname;
  if (
    url.startsWith('/login') ||
    url.startsWith('/sign-up') ||
    url.startsWith('/api/webhooks/clerk') ||
    url.startsWith('/clerk') ||
    url.startsWith('/v1') ||
    url.startsWith('/favicon.ico') ||
    url.startsWith('/not-authorized')
  ) {
    return NextResponse.next();
  }

  // Get Clerk auth info
  const { userId } = await auth();
  if (!userId) {
    // Not authenticated, let Clerk handle redirect
    return NextResponse.next();
  }

  // For protected routes, check if user exists in DB
  if (!url.startsWith('/api/users/me')) {
    try {
      const meRes = await fetch(`${req.nextUrl.origin}/api/users/me`, {
        headers: { Cookie: req.headers.get('cookie') || '' },
      });
      if (meRes.status === 403) {
        // User not in DB, redirect to not-authorized page
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      // If there's an error, allow the request to continue
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|favicon.ico|clerk|v1|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 