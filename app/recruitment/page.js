"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import MemberLoginModal from "@/components/MemberLoginModal";
import { apiRequest } from "@/lib/client-api";

export default function RecruitmentPage() {
  const [memberLoginOpen, setMemberLoginOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);

  useEffect(() => {
    async function checkMember() {
      try {
        const session = await apiRequest("/api/auth/session", { allowUnauthorized: true });
        if (session.authenticated && session.role === "member") {
          setCurrentMember(session.uid);
        }
      } catch (e) {}
    }
    checkMember();
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
      accent: "var(--maroon)",
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
      accent: "var(--green)",
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
      <main className="portal-main subpage-main">
        <section className="subpage-hero glass-card" style={{ padding: '60px 40px', textAlign: 'center', marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="section-kicker" style={{ color: 'var(--brand-red)', fontWeight: 800 }}>MEMBER ENROLLMENT 2026</p>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '10px' }}>Elevate Your Potential</h1>
          <p style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: 'var(--navy-800)', 
            marginBottom: '24px',
            fontStyle: 'italic',
            letterSpacing: '0.01em'
          }}>
            "Best Professional Society Award"
          </p>
          <p style={{ maxWidth: '800px', margin: '0 auto 32px', fontSize: '1.1rem', color: 'var(--text-soft)' }}>
            Join a legacy of technical excellence. We are selecting driven individuals to lead the next generation of innovators at Chandigarh University.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <a 
              href="https://forms.gle/your-external-link-here" 
              className="cta-button" 
              style={{ background: 'var(--navy-900)', color: '#fff', padding: '16px 40px', borderRadius: '12px', textDecoration: 'none', fontWeight: '800' }}
              target="_blank" 
              rel="noopener noreferrer"
            >
              APPLY TO JOIN ISTE
            </a>

            {currentMember ? (
              <div style={{ padding: '16px 32px', background: 'var(--paper-soft)', border: '1px solid var(--line)', borderRadius: '12px', fontWeight: '700' }}>
                Hi, {currentMember}
              </div>
            ) : (
              <button 
                onClick={() => setMemberLoginOpen(true)}
                style={{ 
                  padding: '16px 40px', 
                  background: 'var(--brand-red)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: '800',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Member Login
              </button>
            )}
          </div>
        </section>

        <section className="about-layout">
          <article className="content-sheet wide-sheet" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
            <div className="institutional-grid" style={{ gap: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div className="institutional-card glass-card" style={{ padding: '32px', borderRadius: '24px', background: '#fff', border: '1px solid var(--line)' }}>
                <p className="section-kicker" style={{ color: 'var(--navy-700)' }}>DEVELOPMENT</p>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Technical Mastery</h3>
                <p>Engage in high-level project environments designed to accelerate your growth from student to industry professional.</p>
              </div>
              <div className="institutional-card glass-card" style={{ padding: '32px', borderRadius: '24px', background: '#fff', border: '1px solid var(--line)' }}>
                <p className="section-kicker" style={{ color: 'var(--brand-red)' }}>NETWORK</p>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Institutional Influence</h3>
                <p>Gain access to a powerful ecosystem of industry leaders, academic scholars, and a global alumni network.</p>
              </div>
              <div className="institutional-card glass-card" style={{ padding: '32px', borderRadius: '24px', background: '#fff', border: '1px solid var(--line)' }}>
                <p className="section-kicker" style={{ color: 'var(--maroon)' }}>CAPACITY</p>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Executive Leadership</h3>
                <p>Develop critical management and strategic decision-making skills by leading flagship institutional events.</p>
              </div>
              <div className="institutional-card glass-card" style={{ padding: '32px', borderRadius: '24px', background: '#fff', border: '1px solid var(--line)' }}>
                <p className="section-kicker" style={{ color: 'var(--green)' }}>RECOGNITION</p>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Certificates & Rewards</h3>
                <p>Earn official certificates and rewards for your active participation and contributions to the society.</p>
              </div>
            </div>
          </article>

          <article className="content-sheet wide-sheet" style={{ 
            background: 'var(--paper)', 
            color: 'var(--navy-900)', 
            padding: '80px 40px',
            borderRadius: '24px',
            border: '1px solid var(--line)',
            borderTop: '6px solid var(--brand-red)',
            marginTop: '40px',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ color: 'var(--navy-900)', fontSize: '3rem', margin: '0 0 16px', fontWeight: 900, letterSpacing: '-0.04em' }}>Current Openings</h2>
              <p style={{ color: 'var(--text-soft)', maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.6', fontWeight: 500 }}>
                We are looking for exceptional talent to join our specialized teams. Select your domain of interest and take the first step toward a professional legacy.
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '24px' 
            }}>
              {domains.map((domain) => (
                <div key={domain.id} style={{ 
                  padding: '40px',
                  background: 'var(--paper-soft)',
                  borderRadius: '20px',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '24px',
                  transition: 'all 0.3s ease'
                }}
                className="recruitment-slot"
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: domain.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>RECRUITMENT ACTIVE</span>
                    <h3 style={{ fontSize: '1.6rem', color: 'var(--navy-900)', margin: '8px 0 12px', fontWeight: 800 }}>{domain.name}</h3>
                    <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                      Apply to the <strong>{domain.name}</strong> to collaborate on high-level projects and institutional initiatives.
                    </p>
                  </div>

                  <a 
                    href="#" 
                    className="recruitment-btn"
                    style={{ 
                      background: 'var(--navy-900)', 
                      color: '#fff', 
                      padding: '16px 24px', 
                      borderRadius: '12px',
                      textDecoration: 'none',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Apply for {domain.name.split(' ')[0]} Team
                  </a>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '60px', textAlign: 'center', padding: '32px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed var(--line)' }}>
              <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.95rem', fontWeight: 600 }}>
                Not sure where you fit? Reach out to us at <span style={{ color: 'var(--brand-red)' }}>official@istecu.org</span>
              </p>
            </div>
          </article>        </section>
      </main>

      <MemberLoginModal open={memberLoginOpen} onClose={() => setMemberLoginOpen(false)} />
    </PublicShell>
  );
}
