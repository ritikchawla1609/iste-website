import PublicShell from "@/components/PublicShell";
import EventsTimeline from "@/components/EventsTimeline";
import { sortByDate } from "@/lib/presentation";
import { getPublicSiteData } from "@/lib/site";

export const revalidate = 60;

export default async function EventsPage() {
  const siteData = await getPublicSiteData();
  const events = sortByDate(siteData.events, "eventDate", "startTime");

  return (
    <PublicShell activePath="/events">
      <main className="subpage-main">
        <section className="subpage-premium-hero events-hero-panel">
          <div className="subpage-hero-copy">
            <span className="hero-kicker">Professional Excellence</span>
            <h1 className="subpage-premium-title">Upcoming <span>Chapter Events</span></h1>
            <p className="subpage-premium-desc">
              Explore high-impact workshops, competitive hackathons, and technical seminars
              designed to bridge academia and industry.
            </p>
          </div>
          <div className="subpage-hero-stat-stack" aria-label="Event highlights">
            
          </div>
        </section>

        <EventsTimeline events={events} />
      </main>
    </PublicShell>
  );
}
