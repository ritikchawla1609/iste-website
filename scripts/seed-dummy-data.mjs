import { getDb, initializeDatabase } from "../lib/db.js";
import { isoNow } from "../lib/security.js";

async function seed() {
  console.log("Seeding dummy data...");
  await initializeDatabase();
  const db = await getDb();

  // Clear existing data (optional, but good for a fresh start)
  await db.execute("DELETE FROM applications");
  await db.execute("DELETE FROM events");
  await db.execute("DELETE FROM recruitments");

  // Seed Events
  const event1 = await db.execute(`
    INSERT INTO events (name, category, event_date, start_time, end_time, venue, deadline, registration_link, prizes, description, contact_name, contact_email, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    "Hackathon 2026", "Competition", "2026-05-20", "09:00", "18:00", "Main Auditorium", "2026-05-15", "#", "🏆 $500 + Swag", 
    "Join our annual 24-hour hackathon and showcase your coding skills. Build innovative solutions for real-world problems and win amazing prizes.", 
    "John Doe", "john@iste.org", "published", isoNow(), isoNow()
  ]);

  const event2 = await db.execute(`
    INSERT INTO events (name, category, event_date, start_time, end_time, venue, deadline, registration_link, prizes, description, contact_name, contact_email, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    "Web Dev Workshop", "Workshop", "2026-06-10", "11:00", "14:00", "Room 302", "2026-06-05", "#", "📜 Certification", 
    "Master the latest web technologies in this hands-on workshop led by industry experts. Learn React, Next.js and more.", 
    "Jane Smith", "jane@iste.org", "published", isoNow(), isoNow()
  ]);

  // Seed Recruitments
  const rec1 = await db.execute(`
    INSERT INTO recruitments (title, organization, domain, mode, location, deadline, application_link, description, contact_name, contact_email, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    "Technical Lead", "ISTE Society", "Technology", "In-person", "University Campus", "2026-05-01", "#", 
    "We are looking for a visionary Technical Lead to manage our club's development projects and mentor junior members.", 
    "Admin", "admin@iste.org", "published", isoNow(), isoNow()
  ]);

  const rec2 = await db.execute(`
    INSERT INTO recruitments (title, organization, domain, mode, location, deadline, application_link, description, contact_name, contact_email, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    "Graphic Designer", "ISTE Design Wing", "Creative", "Remote", "Online", "2026-05-10", "#", 
    "Join our creative team! We need a talented designer to create visually stunning assets for our events and social media.", 
    "Sarah Connor", "sarah@iste.org", "published", isoNow(), isoNow()
  ]);

  // Seed Applications (Manual IDs because we don't know the exact auto-inc IDs yet in this script easily without more code, but we can query them)
  const allEvents = await db.many("SELECT id FROM events");
  const allRecs = await db.many("SELECT id FROM recruitments");

  if (allEvents.length > 0) {
    await db.execute(`
      INSERT INTO applications (type, entity_id, name, email, phone, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ["event", allEvents[0].id, "Ritik Sharma", "ritik@example.com", "9876543210", "I love hackathons!", isoNow()]);
  }

  if (allRecs.length > 0) {
    await db.execute(`
      INSERT INTO applications (type, entity_id, name, email, phone, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ["recruitment", allRecs[0].id, "Amit Kumar", "amit@example.com", "1234567890", "Highly experienced in React.", isoNow()]);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
