import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vérifier si la route commence par /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Récupérer le token d'authentification
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // Si pas de token, rediriger vers la page d'accueil
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Récupérer les informations utilisateur depuis le localStorage
    // Note: En middleware, on ne peut pas accéder au localStorage
    // La vérification complète se fera côté client dans les composants
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
};
