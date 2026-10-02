const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  }
];

const ADMIN_PORTAL_URL =
  process.env.ADMIN_PORTAL_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "http://localhost:3001";

const nextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true
      },
      {
        source: "/about.html",
        destination: "/about",
        permanent: true
      },
      // Admin Portal Redirections to standalone application
      {
        source: "/author-dashboard",
        destination: `${ADMIN_PORTAL_URL}/dashboard`,
        permanent: false
      },
      {
        source: "/author-dashboard.html",
        destination: `${ADMIN_PORTAL_URL}/dashboard`,
        permanent: false
      },
      {
        source: "/admin",
        destination: `${ADMIN_PORTAL_URL}/dashboard`,
        permanent: false
      },
      {
        source: "/admin-events",
        destination: `${ADMIN_PORTAL_URL}/events`,
        permanent: false
      },
      {
        source: "/admin-events.html",
        destination: `${ADMIN_PORTAL_URL}/events`,
        permanent: false
      },
      {
        source: "/admin-past-events",
        destination: `${ADMIN_PORTAL_URL}/past-events`,
        permanent: false
      },
      {
        source: "/admin-past-events.html",
        destination: `${ADMIN_PORTAL_URL}/past-events`,
        permanent: false
      },
      {
        source: "/admin-recruitment",
        destination: `${ADMIN_PORTAL_URL}/recruitment`,
        permanent: false
      },
      {
        source: "/admin-recruitment.html",
        destination: `${ADMIN_PORTAL_URL}/recruitment`,
        permanent: false
      },
      {
        source: "/admin-applications",
        destination: `${ADMIN_PORTAL_URL}/applications`,
        permanent: false
      },
      {
        source: "/admin-applications.html",
        destination: `${ADMIN_PORTAL_URL}/applications`,
        permanent: false
      },
      {
        source: "/admin-links",
        destination: `${ADMIN_PORTAL_URL}/recruitment`,
        permanent: false
      },
      {
        source: "/admin-links.html",
        destination: `${ADMIN_PORTAL_URL}/recruitment`,
        permanent: false
      },
      {
        source: "/admin-notice",
        destination: `${ADMIN_PORTAL_URL}/content/notice`,
        permanent: false
      },
      {
        source: "/admin-notice.html",
        destination: `${ADMIN_PORTAL_URL}/content/notice`,
        permanent: false
      },
      {
        source: "/admin-about",
        destination: `${ADMIN_PORTAL_URL}/content/about`,
        permanent: false
      },
      {
        source: "/admin-about.html",
        destination: `${ADMIN_PORTAL_URL}/content/about`,
        permanent: false
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
