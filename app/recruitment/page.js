"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import MemberLoginModal from "@/components/MemberLoginModal";
import { apiRequest } from "@/lib/client-api";
import { RECRUITMENT_TEAMS, resolveTeamApplyUrl } from "@/lib/presentation";

export default function RecruitmentPage() {
  const [memberLoginOpen, setMemberLoginOpen] = useState(false);
  const [teamsVisible, setTeamsVisible] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [recruitments, setRecruitments] = useState([]);
  const [domainStatus, setDomainStatus] = useState({
    "01": "closed",
    "02": "closed",
    "03": "closed",
    "04": "closed",
    "05": "closed",
    "06": "closed"
  });

  useEffect(() => {
    async function checkMember() {
      try {
        const session = await apiRequest("/api/auth/session", { allowUnauthorized: true });
        if (session.authenticated && session.role === "member") {
          setCurrentMember(session.uid);
        }
      } catch (e) {}
    }
    async function loadSiteData() {
      try {
        const response = await apiRequest("/api/public/site-data");
        // domainStatus is managed locally — not overridden from API
        if (response.recruitments) {
          setRecruitments(response.recruitments);
        }
      } catch (e) {}
    }
    checkMember();
    loadSiteData();
  }, []);

  const domains = [
    {
      id: "01",
      name: "Tech Team",
      accent: "var(--navy-700)",
      brief: "The technical backbone. We lead development of web platforms, software tools, and technical workshops to keep the chapter at the forefront of innovation."
    },
    {
      id: "02",
      name: "Event Team",
      accent: "var(--brand-maroon)",
      brief: "The architects of experience. We orchestrate the planning, coordination, and execution of all major chapter events and seminars."
    },
    {
      id: "03",
      name: "Operational Team",
      accent: "var(--navy-800)",
      brief: "The engine of efficiency. We manage logistics, resource allocation, and internal administration to ensure smooth chapter functioning."
    },
    {
      id: "04",
      name: "Media Team",
      accent: "var(--brand-green)",
      brief: "The visual storytellers. We handle photography, videography, and social media strategies to capture and amplify the chapter's impact."
    },
    {
      id: "05",
      name: "Design Team",
      accent: "var(--navy-900)",
      brief: "The creative visionaries. We synthesize aesthetics with functionality to create professional branding, UI/UX, and visual assets for all projects."
    },
    {
      id: "06",
      name: "Sponsorship",
      accent: "#f59e0b",
      brief: "Partner with ISTE to gain unparalleled visibility among the next generation of engineers and innovators. Fuel our events, workshops, and community initiatives.",
      sponsor: true
    }
  ].map((domain) => {
    const team = RECRUITMENT_TEAMS.find((entry) => entry.id === domain.id);
    return team ? { ...domain, keywords: team.keywords } : domain;
  });

  return (
    <PublicShell activePath="/recruitment" noticeHref="/" noticeLabel="Return Home">
      <main className="portal-main subpage-main recruitment-page">
        <section className={`recruitment-drawer-layout ${teamsVisible ? "is-team-open" : ""}`.trim()}>
          <aside className="recruitment-member-drawer">
            <span className="recruitment-drawer-glow glow-one" aria-hidden="true" />
            <span className="recruitment-drawer-glow glow-two" aria-hidden="true" />
            <p className="hero-kicker drawer-kicker-cta">REGISTER NOW !!</p>
            <h1 className="title-hero-premium">Become an ISTE Member</h1>
            <p className="hero-desc">
              Students can register through the official ISTE Student Chapter process and become part of a community built around technical learning, leadership, and innovation.
            </p>


            <div className="recruitment-action-row">
              <button
                type="button"
                className="btn-premium-dark"
                onClick={() => setTeamsVisible(true)}
                aria-controls="team-openings"
                aria-expanded={teamsVisible}
              >
                APPLY TO JOIN ISTE
              </button>

              {currentMember ? (
                <div className="member-pill">
                  Hi, {currentMember}
                </div>
              ) : (
                <button
                  onClick={() => setMemberLoginOpen(true)}
                  className="btn-premium-primary"
                >
                  MEMBER LOGIN
                </button>
              )}
            </div>
          </aside>

          {teamsVisible && (
            <div className="recruitment-back-btn-wrapper">
              <button
                onClick={() => setTeamsVisible(false)}
                className="recruitment-team-back-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-red)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Back to Registration
              </button>
            </div>
          )}
          {teamsVisible && (
            <article className="recruitment-openings-panel" id="team-openings">
              <div className="recruitment-team-heading">
                <div>
                  <h3 className="section-kicker-heading">Team Recruitment</h3>
                  <h2 className="title-section-premium">Current Openings</h2>
                </div>
                <span className="team-count-pill">{domains.length} Teams</span>
              </div>

              <div className="recruitment-openings-grid">
                {domains.map((domain, index) => {
                  const isActive = domainStatus[domain.id] === "active";
                  const applyUrl = resolveTeamApplyUrl(recruitments, domain);
                  const canApply = isActive && Boolean(applyUrl);


                  return (
                    <div
                      key={domain.id}
                      className="recruitment-slot-premium"
                      style={{ "--team-accent": domain.accent, "--card-index": index }}
                    >
                      <div>
                        <span className="team-card-number">{domain.id}</span>
                        {isActive ? (
                          <span className="recruitment-active-badge" style={{ color: "#4ade80", background: "rgba(74, 222, 128, 0.1)" }}>RECRUITMENT ACTIVE</span>
                        ) : (
                          <span className="recruitment-active-badge" style={{ color: "#f87171", background: "rgba(248, 113, 113, 0.1)" }}>RECRUITMENT CLOSED</span>
                        )}
                        <h3 className="title-card-premium">{domain.name}</h3>
                        <p>{domain.brief}</p>
                      </div>

                      {canApply ? (
                        <a
                          href={applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-premium-dark"
                        >
                          Apply for {domain.name.split(' ')[0]} Team
                        </a>
                      ) : (
                        <button
                          disabled
                          className="btn-premium-dark"
                          style={{ opacity: 0.5, cursor: "not-allowed", border: "1px solid rgba(255, 255, 255, 0.05)" }}
                        >
                          {isActive ? "LINK PENDING" : "CLOSED"}
                        </button>
                      )}
                    </div>
                  );
                })}

              </div>
            </article>
          )}
        </section>
      </main>

      <MemberLoginModal open={memberLoginOpen} onClose={() => setMemberLoginOpen(false)} />
    </PublicShell>
  );
}
