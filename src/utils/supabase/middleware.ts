import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;

    // define protected routes
    const isProtectedRoute =
      pathname.startsWith("/protected") || pathname.startsWith("/admin");

    // redirect unauthenticated users to sign-in page
    if (isProtectedRoute && user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const isLoggedIn = request.cookies.get("isLoggedIn")?.value == "true";
    const role = request.cookies.get("role")?.value; // 'Owner' or 'Driver'


    if (!isLoggedIn && isProtectedRoute) {
      console.log(
        "Unauthenticated access to restricted area, redirecting to /login"
      );
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (role?.toLowerCase() === "driver" && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/parking", request.url));
    }

    // "Admin trying to access driver route, redirecting to /admin/bookings"
    if (role?.toLowerCase() === "owner" && pathname.startsWith("/parking")) {
      return NextResponse.redirect(new URL("/admin/bookings", request.url));
    }
    
    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
