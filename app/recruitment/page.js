"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import MemberLoginModal from "@/components/MemberLoginModal";
import { apiRequest } from "@/lib/client-api";

export default function RecruitmentPage() {
  const [memberLoginOpen, setMemberLoginOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [recruitments, setRecruitments] = useState([]);
  const [domainStatus, setDomainStatus] = useState({
    "01": "active",
    "02": "active",
    "03": "active",
    "04": "active",
    "05": "active"
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
        if (response.domainStatus) {
          setDomainStatus(response.domainStatus);
        }
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
    }
  ];

  return (
    <PublicShell activePath="/recruitment" noticeHref="/" noticeLabel="Return Home">
      <main className="portal-main subpage-main recruitment-page">
        <section className="recruitment-hero-card">
          <p className="hero-kicker">How To Register In ISTE?</p>
          <h1 className="title-hero-premium">Become an ISTE Member</h1>
          <p className="recruitment-award-line">Best Professional Society Award</p>
          <p className="hero-desc">
            Students can register through the official ISTE Student Chapter process and become part of a community built around technical learning, leadership, and innovation.
          </p>
          
          <div className="recruitment-action-row">
            <a 
              href="https://forms.gle/your-external-link-here" 
              className="btn-premium-dark" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              APPLY TO JOIN ISTE
            </a>
 
            {currentMember ? (
              <div className="member-pill">
                Hi, {currentMember}
              </div>
            ) : (
              <button 
                onClick={() => setMemberLoginOpen(true)}
                className="btn-premium-primary"
              >
                Member Login
              </button>
            )}
          </div>
        </section>

        <section className="about-layout">
          <article className="content-sheet wide-sheet recruitment-benefits-sheet">
            <div className="institutional-grid">
              <div className="card-premium-flat">
                <p className="section-kicker">Learning</p>
                <h3 className="title-card-premium-sm">Hands-on Technical Growth</h3>
                <p>Joining ISTE provides hands-on technical learning beyond regular academics through events, workshops, and competitions.</p>
              </div>
              <div className="card-premium-flat">
                <p className="section-kicker">Skills</p>
                <h3 className="title-card-premium-sm">Leadership & Teamwork</h3>
                <p>Members develop leadership, teamwork, and communication skills by contributing to real chapter initiatives.</p>
              </div>
              <div className="card-premium-flat">
                <p className="section-kicker">Network</p>
                <h3 className="title-card-premium-sm">Professional Exposure</h3>
                <p>ISTE offers networking opportunities with peers, faculty, and industry professionals across technical domains.</p>
              </div>
              <div className="card-premium-flat">
                <p className="section-kicker">Membership</p>
                <h3 className="title-card-premium-sm">Registration Fee</h3>
                <p>Student membership is Rs. 250 plus a one-time Rs. 50 registration fee. Total payable: Rs. 300 plus 18% GST from 1 January 2026.</p>
              </div>
            </div>
          </article>
 
          <article className="card-premium-flat recruitment-openings-panel">
            <div className="section-header-centered">
              <span className="hero-kicker">Recruitment Active</span>
              <h2 className="title-section-premium">Current Openings</h2>
              <p className="section-subtitle-premium">
                We are looking for exceptional talent to join our specialized teams. Select your domain of interest and take the first step toward a professional legacy.
              </p>
            </div>
 
            <div className="recruitment-openings-grid">
              {domains.map((domain) => {
                const isActive = domainStatus[domain.id] === "active";
                const matchingRec = recruitments.find(r => 
                  r.domain.toLowerCase().includes(domain.name.split(' ')[0].toLowerCase())
                );
                const applyUrl = matchingRec?.applicationLink || "https://forms.gle/your-external-link-here";

                return (
                  <div key={domain.id} className="recruitment-slot-premium">
                    <div>
                      {isActive ? (
                        <span className="recruitment-active-badge" style={{ color: "#4ade80", background: "rgba(74, 222, 128, 0.1)" }}>RECRUITMENT ACTIVE</span>
                      ) : (
                        <span className="recruitment-active-badge" style={{ color: "#f87171", background: "rgba(248, 113, 113, 0.1)" }}>RECRUITMENT CLOSED</span>
                      )}
                      <h3 className="title-card-premium">{domain.name}</h3>
                      <p>{domain.brief}</p>
                    </div>

                    {isActive ? (
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
                        Closed
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
 
            <div className="recruitment-footer-note">
              <p>
                Not sure where you fit? Reach out to us at <span>official@istecu.org</span>
              </p>
            </div>
          </article>
        </section>
      </main>
 
      <MemberLoginModal open={memberLoginOpen} onClose={() => setMemberLoginOpen(false)} />
    </PublicShell>
  );
}
