import PublicShell from "@/components/PublicShell";
import PastEventsClient from "@/components/PastEventsClient";
import { getPublicPastEvents } from "@/lib/site";

const DECK_PAST_EVENTS = [
  {
    id: "logo-launch",
    name: "Logo Launch",
    eventDate: "2024-09-30",
    description:
      "The official launch event introducing the brand logo and identity of the ISTE Student Chapter at Chandigarh University.",
    winners: "Official logo reveal and branding launch of ISTE-CUSC.",
    imagePaths: []
  },
  {
    id: "augury-24",
    name: "Augury",
    eventDate: "2024-10-23",
    description:
      "Official recognition ceremony and induction milestone for the ISTE Student Chapter as a registered professional society.",
    winners: "Inaugural recognition and society induction.",
    imagePaths: []
  },
  {
    id: "mind-sprint",
    name: "Mind Sprint",
    eventDate: "2025-01-21",
    description:
      "A high-intensity technical quiz and problem-solving competition testing computational logic and speed.",
    winners: "Technical evaluation, cognitive speed run, and peer showcase.",
    imagePaths: []
  },
  {
    id: "cumun-25",
    name: "CUMUN",
    eventDate: "2025-02-27",
    description:
      "Chandigarh University Model United Nations organized by the ISTE Student Chapter to promote diplomacy, global debate, and communication skills.",
    winners: "Structured debates, global policy simulations, and highlight awards.",
    imagePaths: []
  },
  {
    id: "technicia-25",
    name: "Technicia",
    eventDate: "2025-10-15",
    description:
      "A national level flagship technical fest featuring hackathons, Capture The Flag challenges, ideathons, and workshops.",
    winners: "Flagship innovation platform, tech showcase, and major project awards.",
    imagePaths: []
  }
];

export const revalidate = 60;

export default async function PastEventsPage() {
  const storedEvents = await getPublicPastEvents();
  const events = storedEvents.length ? storedEvents : DECK_PAST_EVENTS;
  return (
    <PublicShell activePath="/past-events">
      <main className="subpage-main">
        <section className="subpage-premium-hero past-events-hero-panel">
          <div className="subpage-hero-copy">
            <span className="hero-kicker">Our Legacy</span>
            <h1 className="subpage-premium-title">Previous Events & <span>Achievements</span></h1>
            <p className="subpage-premium-desc">
              Celebrating milestones, success stories, and technical breakthroughs from the
              ISTE Student Chapter at Chandigarh University.
            </p>
          </div>
        </section>

        <PastEventsClient events={events} />
      </main>
    </PublicShell>
  );
}
