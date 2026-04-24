"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import { apiRequest } from "@/lib/client-api";

export default function HomePage() {
  const [siteData, setSiteData] = useState(null);
  const [counter, setCounter] = useState(500);

  useEffect(() => {
    async function loadData() {
      try {
        const [data, counterData] = await Promise.all([
          apiRequest("/api/public/site-data"),
          apiRequest("/api/public/counter")
        ]);
        setSiteData(data);
        setCounter(counterData.count || 500);
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
            
            <div className="login-counter-display" style={{ marginTop: '32px', padding: '20px', background: 'var(--paper)', borderRadius: '12px', border: '1px solid var(--line)', display: 'inline-block' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-soft)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Members</p>
              <h2 style={{ margin: '8px 0 0', fontSize: '2.5rem', color: 'var(--navy-900)' }}>700+</h2>
            </div>
          </div>
        </section>

        {/* Home page grid content removed as per request to move them to dedicated pages */}
      </main>
    </PublicShell>
  );
}
