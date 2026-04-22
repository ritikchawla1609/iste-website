"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import { apiRequest } from "@/lib/client-api";

const TEAM_MEMBERS = {
  faculty: [
    { name: "Dr. Arvinder Singh", role: "Faculty Coordinator", image: "/team/faculty-1.jpg" }
  ],
  core: [
    { name: "Shubham", role: "Chairperson", image: "/team/member-placeholder.jpg" },
    { name: "Ananya Sharma", role: "Vice-Chairperson", image: "/team/member-placeholder.jpg" },
    { name: "Rahul Verma", role: "General Secretary", image: "/team/member-placeholder.jpg" }
  ],
  leads: [
    { name: "Ishaan", team: "Tech", role: "Tech Lead", image: "/team/member-placeholder.jpg" },
    { name: "Sanya", team: "Design", role: "Design Lead", image: "/team/member-placeholder.jpg" },
    { name: "Rohan", team: "Media", role: "Media Lead", image: "/team/member-placeholder.jpg" },
    { name: "Kriti", team: "Event", role: "Event Lead", image: "/team/member-placeholder.jpg" },
    { name: "Aryan", team: "Operational", role: "Operational Lead", image: "/team/member-placeholder.jpg" }
  ]
};

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
        <section className="portal-notice-banner" style={{ marginTop: '40px' }}>
          <div className="intro-copy">
            <p className="section-kicker">The Faces of ISTE</p>
            <h1>Our Dedicated Team</h1>
            <p>
              Meet the passionate individuals who work behind the scenes to make the ISTE Student Chapter at Chandigarh University a success.
            </p>
          </div>
        </section>

        <section className="team-content" style={{ paddingBottom: '80px', width: 'var(--container)', margin: '0 auto' }}>
          
          {/* Faculty Section */}
          <div className="team-category" style={{ marginBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--navy-900)' }}>Faculty Coordinator</h2>
              <p style={{ color: 'var(--text-soft)' }}>Guiding us towards excellence</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {TEAM_MEMBERS.faculty.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          </div>

          {/* Core Team Section */}
          <div className="team-category" style={{ marginBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--navy-900)' }}>Core Team</h2>
              <p style={{ color: 'var(--text-soft)' }}>Leading the vision and strategy</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
              {TEAM_MEMBERS.core.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          </div>

          {/* Team Leads Section */}
          <div className="team-category">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--navy-900)' }}>Domain Leads</h2>
              <p style={{ color: 'var(--text-soft)' }}>Experts driving their respective fields</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
              {TEAM_MEMBERS.leads.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          </div>

        </section>
      </main>
    </PublicShell>
  );
}

function TeamCard({ member }) {
  return (
    <div className="portal-card" style={{ padding: '32px', textAlign: 'center', transition: 'all 0.3s ease' }}>
      <div style={{ 
        width: '120px', 
        height: '120px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        margin: '0 auto 24px',
        border: '4px solid var(--paper-soft)',
        boxShadow: 'var(--shadow-soft)'
      }}>
        <img 
          src={member.image} 
          alt={member.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(member.name) + "&background=0f172a&color=fff"; }}
        />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--navy-900)' }}>{member.name}</h3>
      <p style={{ color: 'var(--gold)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {member.role}
      </p>
      {member.team && (
        <span className="pill" style={{ marginTop: '12px', display: 'inline-block' }}>{member.team} Team</span>
      )}
    </div>
  );
}
