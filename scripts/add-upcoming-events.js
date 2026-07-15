import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "iste.db");
const db = new DatabaseSync(dbPath);

console.log("Database path:", dbPath);

const events = [
  {
    name: "SyncCode: Git & GitHub Fundamentals",
    category: "Regular Event",
    event_date: "2026-08-05",
    start_time: "10:00",
    end_time: "15:00",
    venue: "Seminar Hall, Chandigarh University",
    deadline: "2026-08-02",
    registration_link: "#",
    google_form_link: null,
    prizes: "Certificates & Swag",
    description: "Unlock the power of version control with SyncCode! Learn the essentials of Git and GitHub, from repository setup and branching to pull requests and collaborative workflows. Perfect for setting up your project pipelines.",
    contact_name: "ISTE-CUSC",
    contact_email: "iste@cumail.in",
    status: "published",
    poster_path: null,
    min_team_size: 1,
    max_team_size: 1
  },
  {
    name: "Catalyst: Innovation Sprint",
    category: "Regular Event",
    event_date: "2026-09-01",
    start_time: "09:30",
    end_time: "17:00",
    venue: "Tech Block, Chandigarh University",
    deadline: "2026-08-29",
    registration_link: "#",
    google_form_link: null,
    prizes: "🏆 Cash Prizes & Mentorship",
    description: "Accelerate your ideas in Catalyst! A fast-paced ideation sprint and design-thinking challenge where teams brainstorm, prototype, and pitch innovative solutions to pressing real-world issues.",
    contact_name: "ISTE-CUSC",
    contact_email: "iste@cumail.in",
    status: "published",
    poster_path: null,
    min_team_size: 1,
    max_team_size: 3
  },
  {
    name: "Tech Horizons: Emerging Technologies and Future Engineering Trends",
    category: "Regular Event",
    event_date: "2026-10-08",
    start_time: "10:00",
    end_time: "16:00",
    venue: "Main Auditorium, Chandigarh University",
    deadline: "2026-10-05",
    registration_link: "#",
    google_form_link: null,
    prizes: "Certificates & Keynote Access",
    description: "Explore the cutting-edge of technology at Tech Horizons. Dive into interactive keynotes and tech showcases focusing on AI, Cloud Computing, Web3, and the future trends shaping modern engineering.",
    contact_name: "ISTE-CUSC",
    contact_email: "iste@cumail.in",
    status: "published",
    poster_path: null,
    min_team_size: 1,
    max_team_size: 1
  },
  {
    name: "Navachetana: Product Revival Challenge",
    category: "Core Event",
    event_date: "2026-11-03",
    start_time: "09:00",
    end_time: "17:30",
    venue: "MBA Block Hall, Chandigarh University",
    deadline: "2026-10-31",
    registration_link: "#",
    google_form_link: null,
    prizes: "🏆 Prizes worth 10K & Certificates",
    description: "Bring outdated products back to life in Navachetana! Challenge your product management and design skills by analyzing a legacy product, identifying pain points, and proposing a modern revival strategy.",
    contact_name: "ISTE-CUSC",
    contact_email: "iste@cumail.in",
    status: "published",
    poster_path: null,
    min_team_size: 1,
    max_team_size: 4
  }
];

const now = new Date().toISOString();

for (const event of events) {
  const existing = db.prepare("SELECT id FROM events WHERE name = ?").get(event.name);
  if (existing) {
    console.log(`Event already exists: "${event.name}" (ID: ${existing.id})`);
  } else {
    const result = db.prepare(`
      INSERT INTO events (
        name, category, event_date, start_time, end_time, venue, deadline,
        registration_link, google_form_link, prizes, description, contact_name, contact_email,
        status, poster_path, min_team_size, max_team_size, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.name,
      event.category,
      event.event_date,
      event.start_time,
      event.end_time,
      event.venue,
      event.deadline,
      event.registration_link,
      event.google_form_link,
      event.prizes,
      event.description,
      event.contact_name,
      event.contact_email,
      event.status,
      event.poster_path,
      event.min_team_size,
      event.max_team_size,
      now,
      now
    );
    console.log(`Successfully added event: "${event.name}"`);
  }
}
