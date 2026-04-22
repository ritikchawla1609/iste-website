const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-Frame-Options",
    value: "DENY"
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

const nextConfig = {
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
      {
        source: "/author-dashboard.html",
        destination: "/author-dashboard",
        permanent: true
      },
      {
        source: "/admin-events.html",
        destination: "/admin-events",
        permanent: true
      },
      {
        source: "/admin-recruitment.html",
        destination: "/admin-recruitment",
        permanent: true
      },
      {
        source: "/admin-notice.html",
        destination: "/admin-notice",
        permanent: true
      },
      {
        source: "/admin-about.html",
        destination: "/admin-about",
        permanent: true
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
