import PublicShell from "@/components/PublicShell";

const FACULTY_ADVISORS = [
  {
    name: "Prof. Dr. Sandeep Singh Kang",
    role: "Chapter Advisor",
    image: "/team/faculty-sandeep.jpg"
  },
  {
    name: "Prof. Dr. Neetu Rani",
    role: "Associate Director - CSE 3rd Year",
    image: "/team/faculty-neetu.jpg"
  },
  {
    name: "Prof. Dr. Neha Dutta",
    role: "Chapter Co-Advisor",
    image: "/team/faculty-neha.jpg"
  }
];

const OFFICE_BEARERS = [
  { name: "Sahil Wadhwa", role: "President", image: "/team/sahil-wadia.png" },
  { name: "Yatin Berry", role: "Vice President", image: "/team/yatin-berry.png" },
  { name: "Srishti", role: "General Secretary", image: "/team/srishti-nautiyal.png" }
];

const JOINT_SECRETARY = [
  { name: "Amit Kumar", role: "Joint Secretary" },
  { name: "Krishnam", role: "Joint Secretary", image: "/team/krishnam-gupta.png" },
  { name: "Jatin Mittal", role: "Joint Secretary" },
  { name: "Dinky Khurana", role: "Joint Secretary" }
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
  return (
    <PublicShell activePath="/team">
      <main className="subpage-main">
        <section className="subpage-hero" style={{ padding: '80px 0 40px' }}>
          <div className="hero-context">
            <span className="section-kicker">The Faces of ISTE</span>
          </div>
          <h1 className="hero-title">Our <span className="brand-text">Dedicated Team</span></h1>
          <div className="title-accent-line" style={{ margin: '20px auto 30px' }}></div>
          <p className="hero-description">
            Meet the passionate individuals who work behind the scenes to make the ISTE Student Chapter 
            at Chandigarh University a beacon of technical excellence.
          </p>
        </section>

        <section className="about-team-section">
          <div className="team-container">
          
            {/* Faculty Advisors Section */}
            <div className="team-group">
              <div className="team-group-header">
                <p className="section-kicker">Guidance</p>
                <h2>Faculty Advisors</h2>
              </div>
              <div className="team-grid team-grid-featured">
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
              <div className="team-grid team-grid-featured">
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
              <div className="team-grid">
                {JOINT_SECRETARY.map((member) => (
                  <TeamCard key={member.name} member={member} isLead={true} />
                ))}
              </div>
            </div>

            {/* Domain Sections */}
            {DOMAIN_TEAMS.map((group) => (
              <div key={group.domain} className="team-group" style={{ marginTop: '60px' }}>
                <div className="team-group-header" style={{ borderBottom: `2px solid ${group.color}`, paddingBottom: '16px', marginBottom: '32px' }}>
                  <p className="section-kicker" style={{ color: group.color }}>Domain</p>
                  <h2 style={{ color: 'var(--navy-900)' }}>{group.domain}</h2>
                </div>
                
                <div className="team-domain-row">
                  {/* Domain Lead */}
                  <div className="team-domain-lead-col">
                    <div style={{ marginBottom: '12px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: group.color, letterSpacing: '0.1em' }}>
                      Domain Lead
                    </div>
                    <TeamCard member={group.lead} isLead={true} accentColor={group.color} />
                  </div>
                  
                  {/* Team Members */}
                  <div className="team-domain-members-col">
                    <div style={{ marginBottom: '12px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-soft)', letterSpacing: '0.1em' }}>
                      Team Members
                    </div>
                    <div className="team-members-subgrid">
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
    </PublicShell>
  );
}

function TeamCard({ member, isLead = false, isSmall = false, accentColor = 'var(--brand-red)' }) {
  const avatarUrl = member.image && !member.image.includes("member-placeholder")
    ? member.image
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0f172a&color=fff&size=256`;
  
  return (
    <div 
      className={`team-member-card ${isSmall ? 'is-small' : ''}`} 
      style={{ borderTop: isLead ? `4px solid ${accentColor}` : undefined }}
    >
      <div className="member-photo">
        <img 
          src={avatarUrl} 
          alt={member.name} 
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="member-info">
        <h3 style={{ fontSize: isSmall ? '1rem' : '1.2rem' }}>{member.name}</h3>
        <p className="member-role" style={{ fontSize: isSmall ? '0.75rem' : '0.85rem' }}>{member.role}</p>
      </div>
    </div>
  );
}
