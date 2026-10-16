import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { isAdDetailPath } from './lib/ad-url';

// Configuration for public and auth routes
// Routes accessible by everyone (authenticated and unauthenticated)
const PUBLIC_ROUTES = ['/', '/search', '/ads', '/offices', '/menu', '/contact', '/evaluation', '/privacy', '/terms', '/copyright', '/about'];

// Routes accessible only by unauthenticated users (guests)
const GUEST_ROUTES = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/verify'];

// Routes accessible only by super_admin
const ADMIN_ROUTES = ['/admin'];

// Create the i18n middleware
const baseIntlMiddleware = createMiddleware(routing);

function intlMiddleware(request: NextRequest) {
  if (!request.cookies.get('NEXT_LOCALE')) {
    request.cookies.set('NEXT_LOCALE', routing.defaultLocale);
  }
  return baseIntlMiddleware(request);
}

function getUserRole(request: NextRequest): string | null {
  try {
    const authUser = request.cookies.get('auth-user')?.value;
    if (!authUser) return null;
    const parsed = JSON.parse(decodeURIComponent(authUser));
    return parsed?.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Allow SEO/public files directly
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return NextResponse.next();
  }
  const authToken = request.cookies.get('auth-token')?.value;
  const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';

  // SEO ad pages: /{purpose}/{type}/{governorate}/{area}/{id}
  const isPublicRoute = isAdDetailPath(pathnameWithoutLocale) || PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathnameWithoutLocale === route;

    // Handle specific routes
    if (route === '/ads') {
      const isProtectedAdRoute = pathnameWithoutLocale.startsWith('/ads/create') || pathnameWithoutLocale.startsWith('/ads/edit');
      return pathnameWithoutLocale.startsWith('/ads') && !isProtectedAdRoute;
    }
    if (route === '/offices') return pathnameWithoutLocale.startsWith('/offices');

    return pathnameWithoutLocale.startsWith(route);
  });

  const isGuestRoute = GUEST_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathnameWithoutLocale.startsWith(route));

  // 1. If user is authenticated (has token)
  if (authToken) {
    const role = getUserRole(request);

    // If they try to access guest-only routes (like login/signup), redirect to home
    if (isGuestRoute) {
      // If admin, redirect to admin dashboard
      if (role === 'super_admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. Super Admin Restriction: If super_admin, they can ONLY access admin routes
    if (role === 'super_admin' && !isAdminRoute && !isGuestRoute) {
      const prefix = pathname.match(/^\/(en|ar)/)?.[0] || '';
      return NextResponse.redirect(new URL(`${prefix}/admin`, request.url));
    }

    // Allow all other routes (public and protected)
    return intlMiddleware(request);
  }

  // 2. If user is NOT authenticated
  if (!authToken) {
    // Block admin routes
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // If they are on a public or guest route, let them through
    if (isPublicRoute || isGuestRoute) {
      return intlMiddleware(request);
    }

    // Otherwise, redirect everything else to signin
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon-48.png|icon-192.png|icon-512.png|apple-touch-icon.png|manifest.webmanifest|sitemap.xml|robots.txt|images|locales).*)",
  ],
};
