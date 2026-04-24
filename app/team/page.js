"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import { apiRequest } from "@/lib/client-api";

const FACULTY_ADVISORS = [
  { 
    name: "Prof. Dr. Sandeep Singh Kang", 
    role: "Deputy Head of Department", 
    image: "/team/faculty-sandeep.jpg" 
  },
  { 
    name: "Prof. Dr. Neetu Ma'am", 
    role: "Faculty Advisor", 
    image: "/team/faculty-neetu.jpg" 
  },
  { 
    name: "Prof. Dr. Neha Dutta", 
    role: "Co - Faculty Advisor", 
    image: "/team/faculty-neha.jpg" 
  }
];

const OFFICE_BEARERS = [
  { name: "Sahil Wadia", role: "President", image: "/team/sahil-wadia.png" },
  { name: "Yatin Berry", role: "Vice President", image: "/team/yatin-berry.png" },
  { name: "Srishti Nautiyal", role: "General Secretary", image: "/team/srishti-nautiyal.png" }
];

const JOINT_SECRETARY = [
  { name: "Krishnam Gupta", role: "Joint Secretary", image: "/team/krishnam-gupta.png" }
];

const DOMAIN_TEAMS = [
  {
    domain: "Tech Team",
    color: "var(--navy-700)",
    lead: { name: "Tanisha Goyal", role: "Tech Lead", image: "/team/tanisha-goyal.png" },
    members: [
      { name: "Aditya", role: "Team Member" },
      { name: "Mehak", role: "Team Member" },
      { name: "Kabir", role: "Team Member" }
    ]
  },
  {
    domain: "Design Team",
    color: "var(--navy-900)",
    lead: { name: "Sanya", role: "Design Lead", image: "/team/member-placeholder.jpg" },
    members: [
      { name: "Riya", role: "Team Member" },
      { name: "Arjun", role: "Team Member" },
      { name: "Siddharth", role: "Team Member" }
    ]
  },
  {
    domain: "Media Team",
    color: "var(--green)",
    lead: { name: "Rohan", role: "Media Lead", image: "/team/member-placeholder.jpg" },
    members: [
      { name: "Tanya", role: "Team Member" },
      { name: "Yash", role: "Team Member" },
      { name: "Anika", role: "Team Member" }
    ]
  },
  {
    domain: "Event Team",
    color: "var(--maroon)",
    lead: { name: "Sneha Yadav", role: "Event Lead", image: "/team/sneha-yadav.png" },
    members: [
      { name: "Aarav", role: "Team Member" },
      { name: "Sia", role: "Team Member" },
      { name: "Pranav", role: "Team Member" }
    ]
  },
  {
    domain: "Operational Team",
    color: "var(--navy-800)",
    lead: { name: "Ritik Chawla", role: "Operational Lead", image: "/team/member-placeholder.jpg" },
    members: [
      { name: "Ishani", role: "Team Member" },
      { name: "Varun", role: "Team Member" },
      { name: "Zara", role: "Team Member" }
    ]
  }
];

export default function TeamPage() {
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

  return (
    <PublicShell activePath="/team">
      <main className="subpage-main">
        <section className="subpage-hero" style={{ padding: '80px 0 40px' }}>
          <div className="hero-context">
            <span className="section-kicker">The Faces of ISTE</span>
          </div>
          <h1 className="hero-title">Our <span className="brand-text">Dedicated Team</span></h1>
          <p className="hero-description">
            Meet the passionate individuals who work behind the scenes to make the ISTE Student Chapter 
            at Chandigarh University a beacon of technical excellence.
          </p>
          <div className="title-accent-line"></div>
        </section>

        <section className="about-team-section">
          <div className="team-container">
          
            {/* Faculty Advisors Section */}
            <div className="team-group">
              <div className="team-group-header">
                <p className="section-kicker">Guidance</p>
                <h2>Faculty Advisors</h2>
              </div>
              <div className="team-grid">
                {FACULTY_ADVISORS.map((member) => (
                  <TeamCard key={member.name} member={member} isLead={true} />
                ))}
              </div>
            </div>

            {/* Office Bearers Section */}
            <div className="team-group">
              <div className="team-group-header">
                <p className="section-kicker">Leadership</p>
                <h2>Office Bearers</h2>
              </div>
              <div className="team-grid">
                {OFFICE_BEARERS.map((member) => (
                  <TeamCard key={member.name} member={member} isLead={true} />
                ))}
              </div>
            </div>

            {/* Joint Secretary Section */}
            <div className="team-group">
              <div className="team-group-header">
                <p className="section-kicker">Administrative Support</p>
                <h2>Joint Secretary</h2>
              </div>
              <div className="team-grid-center" style={{ display: 'flex', justifyContent: 'center' }}>
                {JOINT_SECRETARY.map((member) => (
                  <div key={member.name} style={{ maxWidth: '350px', width: '100%' }}>
                    <TeamCard member={member} isLead={true} />
                  </div>
                ))}
              </div>
            </div>

            {/* Domain Sections */}
            {DOMAIN_TEAMS.map((group) => (
              <div key={group.domain} className="team-group" style={{ marginTop: '80px' }}>
                <div className="team-group-header" style={{ borderBottom: `2px solid ${group.color}`, paddingBottom: '16px', marginBottom: '40px' }}>
                  <p className="section-kicker" style={{ color: group.color }}>Domain</p>
                  <h2 style={{ color: 'var(--navy-900)' }}>{group.domain}</h2>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
                  {/* Domain Lead */}
                  <div style={{ gridColumn: 'span 4' }}>
                    <div style={{ marginBottom: '12px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: group.color, letterSpacing: '0.1em' }}>
                      Domain Lead
                    </div>
                    <TeamCard member={group.lead} isLead={true} accentColor={group.color} />
                  </div>
                  
                  {/* Team Members */}
                  <div style={{ gridColumn: 'span 8' }}>
                    <div style={{ marginBottom: '12px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-soft)', letterSpacing: '0.1em' }}>
                      Team Members
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                      {group.members.map((member) => (
                        <TeamCard key={member.name} member={member} isSmall={true} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </section>
      </main>

      <style jsx>{`
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .team-group > div:nth-child(2) { display: flex !important; flex-direction: column !important; }
          .team-group > div:nth-child(2) > div { grid-column: span 12 !important; width: 100% !important; }
        }
      `}</style>
    </PublicShell>
  );
}

function TeamCard({ member, isLead = false, isSmall = false, accentColor = 'var(--brand-red)' }) {
  const avatarUrl = member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0f172a&color=fff&size=256`;
  
  return (
    <div className={`team-member-card ${isSmall ? 'is-small' : ''}`} style={{ 
      borderTop: isLead ? `4px solid ${accentColor}` : '1px solid var(--line)',
      padding: isSmall ? '16px' : '24px'
    }}>
      <div className="member-photo" style={{ 
        height: isSmall ? '180px' : 'auto',
        aspectRatio: isSmall ? '1/1' : '1/1.1'
      }}>
        <img 
          src={avatarUrl} 
          alt={member.name} 
          loading="lazy"
          onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(member.name) + "&background=0f172a&color=fff"; }}
        />
      </div>
      <div className="member-info">
        <h3 style={{ fontSize: isSmall ? '1rem' : '1.2rem' }}>{member.name}</h3>
        <p className="member-role" style={{ fontSize: isSmall ? '0.75rem' : '0.85rem' }}>{member.role}</p>
      </div>
    </div>
  );
}
