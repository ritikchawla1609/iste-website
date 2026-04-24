import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { getPublicSiteData } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us | ISTE Society",
  description:
    "About the ISTE Student Chapter, its vision, objectives, and official chapter purpose."
};

export default async function AboutPage() {
  const { about } = await getPublicSiteData();

  return (
    <PublicShell activePath="/about" noticeHref="/" noticeLabel="Return Home">
      <main className="portal-main subpage-main">
        <section className="subpage-hero">
          <p className="section-kicker">About Us</p>
          <h1>{about.heroTitle}</h1>
        </section>

        {/* Consolidated About Us Card - All core content lives here */}
        <section className="about-consolidated-section">
          <div className="about-main-card">
            <div className="card-header-accent"></div>
            
            <div className="about-section-block">
              <h2>{about.overviewTitle}</h2>
              <div className="about-content-body">
                <p>{about.overviewParagraphOne}</p>
                <p>{about.overviewParagraphTwo}</p>
                <p>{about.heroText}</p>
              </div>
            </div>
            
            <div className="about-section-block">
              <h3>{about.visionTitle}</h3>
              <ul className="detail-list">
                {about.visionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="about-section-block">
              <h3>{about.focusTitle}</h3>
              <div className="focus-grid">
                {about.focusCards.map((card) => (
                  <div className="focus-card" key={card.title}>
                    <h4>{card.title}</h4>
                    <p>{card.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-section-block">
              <h3>{about.adminNoteTitle}</h3>
              <div className="info-banner">{about.adminNoteText}</div>
            </div>
          </div>
        </section>

        {/* Team Sections */}
        <section className="about-team-section">
          <div className="team-container">

            <div className="team-group">
              <div style={{ 
                background: 'var(--navy-900)', 
                borderRadius: '24px', 
                padding: '60px 40px', 
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}>
                <p className="section-kicker" style={{ color: 'var(--brand-red)', marginBottom: '16px' }}>Our Team</p>
                <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '20px' }}>Meet the Visionaries</h2>
                <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 40px', fontSize: '1.1rem' }}>
                  Our chapter is powered by a dedicated team of faculty advisors, office bearers, and domain leads 
                  who work tirelessly to foster technical growth and innovation.
                </p>
                <Link 
                  href="/team" 
                  className="team-cta-btn"
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '16px 40px',
                    background: 'var(--brand-red)',
                    color: '#fff',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '800',
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'all 0.3s ease'
                  }}
                >
                  View Full Team Structure
                </Link>
              </div>
            </div>

          </div>
        </section>
            </main>
            </PublicShell>
            );
            }

function TeamMemberCard({ name, role, image, team }) {
  const avatarUrl = image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=fff&size=256`;
  
  return (
    <div className="team-member-card">
      <div className="member-photo">
        <img src={avatarUrl} alt={name} loading="lazy" />
      </div>
      <div className="member-info">
        <h3>{name}</h3>
        <p className="member-role">{role}</p>
      </div>
    </div>
  );
}
