"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import { apiRequest } from "@/lib/client-api";

export default function HomePage() {
  const [siteData, setSiteData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiRequest("/api/public/site-data");
        setSiteData(data);
      } catch (error) {
        console.error("Failed to load site data:", error);
      }
    }
    loadData();
  }, []);

  if (!siteData) return null;

  return (
    <PublicShell activePath="/">
      <main className="portal-main">
        <section className="portal-notice-banner">
          <div className="intro-copy">
            <p className="section-kicker">Welcome to ISTE CU</p>
            <h1>
              ISTE Student Chapter of Chandigarh University aims to provide students with the
              resources and means to follow their dreams.
            </h1>
            <p>
              Supporting technical growth, innovation, and meaningful student development through 
              an organized and professional platform.
            </p>
          </div>
        </section>

        {/* Home page grid content removed as per request to move them to dedicated pages */}
      </main>
    </PublicShell>
  );
}
