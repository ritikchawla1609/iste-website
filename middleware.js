import { NextResponse } from "next/server";

export function middleware(request) {
  const origin = request.headers.get("origin");
  const isApi = request.nextUrl.pathname.startsWith("/api/");

  if (isApi) {
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      if (origin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Requested-With"
        );
        response.headers.set("Access-Control-Max-Age", "86400");
      }
      return response;
    }

    const response = NextResponse.next();
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
