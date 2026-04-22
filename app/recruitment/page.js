"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import { apiRequest } from "@/lib/client-api";
import { safeUrl } from "@/lib/presentation";

const TEAMS = ["Tech", "Design", "Media", "Event", "Operational"];

export default function RecruitmentPage() {
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

  const recruitments = siteData.recruitments || [];

  // Group recruitments by team (domain)
  const groupedRecruitments = TEAMS.reduce((acc, team) => {
    acc[team] = recruitments.filter(
      (r) => r.domain?.toLowerCase() === team.toLowerCase()
    );
    return acc;
  }, {});

  return (
    <PublicShell activePath="/recruitment">
      <main className="subpage-main">
        <section className="portal-notice-banner" style={{ marginTop: '40px' }}>
          <div className="intro-copy">
            <p className="section-kicker">Join the Team</p>
            <h1>Recruitment & Opportunities</h1>
            <p>
              Become a part of the ISTE Student Chapter. We are looking for passionate individuals to join our various domains and contribute to our community.
            </p>
          </div>
        </section>

        <section className="recruitment-teams" style={{ paddingBottom: '80px', width: 'var(--container)', margin: '0 auto' }}>
          {TEAMS.map((team) => (
            <div key={team} className="team-section" style={{ marginBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--navy-900)', whiteSpace: 'nowrap' }}>{team} Team</h2>
                <div style={{ height: '2px', background: 'var(--line)', width: '100%' }}></div>
              </div>

              <div className="listing-stack">
                {groupedRecruitments[team].length ? (
                  groupedRecruitments[team].map((item) => (
                    <article className="listing-card" key={item.id} style={{ maxWidth: '100%', margin: '0 0 24px' }}>
                      <div className="listing-tags">
                        <span className="pill">{item.domain}</span>
                        <span className="meta-chip">{item.mode}</span>
                      </div>
                      <h3 style={{ fontSize: '1.4rem' }}>{item.title}</h3>
                      <p className="listing-copy">{item.description}</p>
                      <div className="listing-footer">
                        <a 
                          className="text-link" 
                          href={safeUrl(item.applicationLink)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Apply for {team} →
                        </a>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state-mini" style={{ padding: '32px', background: 'var(--paper)', borderRadius: '12px', border: '1px dashed var(--line)', color: 'var(--text-soft)', textAlign: 'center' }}>
                    No active openings for {team} team at the moment.
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>
    </PublicShell>
  );
}
