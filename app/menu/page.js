"use client";
 
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/client-api";

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const AboutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const UpcomingEventsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const PreviousEventsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <polyline points="3 3 3 8 8 8"/>
    <line x1="12" x2="12" y1="7" y2="12"/>
    <line x1="12" x2="16" y1="12" y2="14"/>
  </svg>
);

const RecruitmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M9 3v18"/>
    <path d="M3 9h18"/>
  </svg>
);

export default function MobileMenuPage() {
  const router = useRouter();
  const [session, setSession] = useState({ authenticated: false, role: null, uid: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const data = await apiRequest("/api/auth/session", { allowUnauthorized: true });
        setSession(data);
      } catch (err) {
        console.error("Failed to fetch session on mobile menu:", err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const menuItems = [
    { href: "/", label: "Home Page", icon: <HomeIcon /> },
    { href: "/about", label: "About Us", icon: <AboutIcon /> },
    { href: "/events", label: "Upcoming Events", icon: <UpcomingEventsIcon /> },
    { href: "/past-events", label: "Previous Events", icon: <PreviousEventsIcon /> },
    { href: "/recruitment", label: "Recruitment", icon: <RecruitmentIcon /> },
  ];

  // If authenticated, add a link to the dashboard
  if (session.authenticated) {
    if (session.role === "member") {
      menuItems.push({ href: "/recruitment", label: "Member Portal", icon: <DashboardIcon /> });
    } else {
      menuItems.push({ href: "/author-dashboard", label: "Author Dashboard", icon: <DashboardIcon /> });
    }
  }

  return (
    <main className="mobile-menu-page">
      <div className="menu-page-header">
        <h1 className="menu-page-title">Menu</h1>
        <button onClick={() => router.back()} className="menu-close-btn" aria-label="Close menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="menu-page-list">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href} className="menu-page-item">
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
