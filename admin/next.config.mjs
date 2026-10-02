/** @type {import('next').NextConfig} */
const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/author-dashboard",
        destination: "/dashboard",
        permanent: false
      },
      {
        source: "/admin-events",
        destination: "/events",
        permanent: false
      },
      {
        source: "/admin-past-events",
        destination: "/past-events",
        permanent: false
      },
      {
        source: "/admin-recruitment",
        destination: "/recruitment",
        permanent: false
      },
      {
        source: "/admin-applications",
        destination: "/applications",
        permanent: false
      },
      {
        source: "/admin-notice",
        destination: "/content/notice",
        permanent: false
      },
      {
        source: "/admin-about",
        destination: "/content/about",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
