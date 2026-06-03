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
        source: "/admin-links",
        destination: "/admin-recruitment",
        permanent: true
      },
      {
        source: "/admin-links.html",
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
