"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/events", label: "Upcoming Events", icon: "📅" },
  { href: "/past-events", label: "Past Events", icon: "🏆" },
  { href: "/recruitment", label: "Recruitment", icon: "👥" },
  { href: "/applications", label: "Applications", icon: "📝" },
  { href: "/content/notice", label: "What's New", icon: "📢" },
  { href: "/content/about", label: "About Us", icon: "ℹ️" },
  { href: "/settings", label: "Backups & Settings", icon: "⚙️" }
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav-bar" aria-label="Admin Navigation">
      <div className="admin-nav-inner">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? "is-active" : ""}`.trim()}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
