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
  { name: "Srishti", role: "General Secretary", image: "/team/srishti-nautiyal.png" },
  { name: "Amit Kumar", role: "Joint Secretary", image: "/team/amit-kumar.jpg" },
  { name: "Krishnam", role: "Joint Secretary", image: "/team/krishnam-gupta.png" },
  { name: "Jatin Mittal", role: "Joint Secretary" },
  { name: "Dinky Khurana", role: "Joint Secretary", image: "/team/dinky-khurana.jpg" }
];

const DOMAIN_TEAMS = [
  {
    domain: "Tech Team",
    color: "var(--navy-700)",
    lead: { name: "Tanisha Goyal", role: "Tech Lead", image: "/team/tanisha-goyal.png" },
    members: [
      { name: "Satvik", role: "Team Member" },
      { name: "Kunal", role: "Team Member" },
      { name: "Shubham", role: "Team Member" },
      { name: "Sharik", role: "Team Member" }
    ]
  },
  {
    domain: "Design Team",
    color: "var(--navy-900)",
    lead: { name: "Ridhima", role: "Design Lead", image: "/team/member-placeholder.jpg" },
    members: [
      { name: "Akshat", role: "Team Member" },
      { name: "Garvita", role: "Team Member" },
      { name: "Pratishtha", role: "Team Member" }
    ]
  },
  {
    domain: "Media Team",
    color: "var(--green)",
    lead: { name: "Areeb", role: "Media Lead", image: "/team/member-placeholder.jpg" },
    members: [
      { name: "Mehul", role: "Team Member" },
      { name: "Swayam", role: "Team Member" },
      { name: "Aarit", role: "Team Member" },
      { name: "Rimil", role: "Team Member" },
      { name: "Saweta", role: "Team Member" },
      { name: "Ruhani", role: "Team Member" }
    ]
  },
  {
    domain: "Event Team",
    color: "var(--maroon)",
    lead: { name: "Sneha Yadav", role: "Event Lead", image: "/team/sneha-yadav.png" },
    members: [
      { name: "Arnav", role: "Team Member" },
      { name: "Dewanshu", role: "Team Member" },
      { name: "Harsh", role: "Team Member" },
      { name: "Maanas", role: "Team Member" },
      { name: "Nitika", role: "Team Member" },
      { name: "Prayag", role: "Team Member" },
      { name: "Ritish", role: "Team Member" },
      { name: "Shatrupa", role: "Team Member" },
      { name: "Vaani", role: "Team Member" },
      { name: "Dibyashree", role: "Team Member" }
    ]
  },
  {
    domain: "Operational Team",
    color: "var(--navy-800)",
    lead: { name: "Ritik Chawla", role: "Operational Lead", image: "/team/ritik-chawla.png" },
    members: [
      { name: "Divyans Verma", role: "Team Member" },
      { name: "Varun", role: "Team Member" },
      { name: "Aryan Ray", role: "Team Member" },
      { name: "Aditya Kushwaha", role: "Team Member" },
      { name: "Aditya Jamwal", role: "Team Member" },
      { name: "Prabal Pratap", role: "Team Member" },
      { name: "Anay Singh", role: "Team Member" },
      { name: "Milin Sharma", role: "Team Member" },
      { name: "Bhavishay", role: "Team Member" }
    ]
  }
];

export default function TeamPage() {
  return (
    <PublicShell activePath="/team">
      <main className="subpage-main">
        <section className="subpage-hero" style={{ padding: '35px 0 15px' }}>
          <div className="hero-context">
            <span className="section-kicker">The Faces of ISTE</span>
          </div>
          <h1 className="hero-title">Our <span className="brand-text">Dedicated Team</span></h1>
          <div className="title-accent-line" style={{ margin: '10px auto 15px' }}></div>
          <p className="hero-description" style={{ marginBottom: '0px' }}>
            Meet the passionate individuals who work behind the scenes to make the ISTE Student Chapter 
            at Chandigarh University a beacon of technical excellence.
          </p>
        </section>

        <section className="about-team-section">
          <div className="team-container">
          
            {/* Faculty Advisors Section */}
            <div className="team-group">
              <div className="team-group-header">
                <h2>Faculty Advisors</h2>
              </div>
              <div className="team-grid team-grid-featured">
                {FACULTY_ADVISORS.map((member) => (
                  <TeamCard key={member.name} member={member} isLead={true} isFaculty={true} />
                ))}
              </div>
            </div>

            {/* Office Bearers Section */}
            <div className="team-group">
              <div className="team-group-header">
                <h2>Office Bearers</h2>
              </div>
              <div className="team-grid team-grid-featured">
                {OFFICE_BEARERS.map((member) => (
                  <TeamCard key={member.name} member={member} isLead={true} />
                ))}
              </div>
            </div>



            {/* Domain Sections */}
            {DOMAIN_TEAMS.map((group) => (
              <div key={group.domain} className="team-group" style={{ marginTop: '60px' }}>
                <div className="team-group-header" style={{ borderBottom: `2px solid ${group.color}`, paddingBottom: '16px', marginBottom: '32px' }}>

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

function TeamCard({ member, isLead = false, isSmall = false, accentColor = 'var(--brand-red)', photoOnly = false, isFaculty = false }) {
  const hasPhoto = member.image && !member.image.includes("member-placeholder");
  const avatarUrl = hasPhoto
    ? member.image
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1e293b&color=ef2b2f&bold=true&size=256`;

  return (
    <div className={`team-member-card ${isSmall ? 'is-small' : ''} ${isLead ? 'is-lead' : ''} ${photoOnly ? 'is-photo-only' : ''} ${isFaculty ? 'is-faculty' : ''}`}>
      {/* gradient glow border */}
      <span className="tmc-glow" aria-hidden="true" />
      {/* dark inset */}
      <b className="tmc-inset" aria-hidden="true" />

      <div className="tmc-photo-wrapper">
        <img
          className="tmc-photo"
          src={avatarUrl}
          alt={member.name}
          loading="lazy"
          decoding="async"
        />
      </div>

      {!photoOnly && (
        <div className="tmc-content">
          <h3 className="tmc-name">{member.name}</h3>
          <span className="tmc-role">{member.role}</span>
        </div>
      )}
    </div>
  );
}
