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
          <p>{about.heroText}</p>
        </section>

        <section className="about-layout">
          <article className="content-sheet">
            <h2>{about.overviewTitle}</h2>
            <p>{about.overviewParagraphOne}</p>
            <p>{about.overviewParagraphTwo}</p>
          </article>

          <article className="content-sheet">
            <h2>{about.visionTitle}</h2>
            <ul className="detail-list">
              {about.visionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="content-sheet wide-sheet">
            <h2>{about.focusTitle}</h2>
            <div className="focus-grid">
              {about.focusCards.map((card) => (
                <div className="focus-card" key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="content-sheet wide-sheet">
            <div className="institutional-grid">
              <div className="institutional-card">
                <h2>{about.facultyTitle}</h2>
                <p>{about.facultyText}</p>
              </div>
              <div className="institutional-card">
                <h2>{about.teamTitle}</h2>
                <p>{about.teamText}</p>
              </div>
              <div className="institutional-card">
                <h2>{about.galleryTitle}</h2>
                <p>{about.galleryText}</p>
              </div>
              <div className="institutional-card">
                <h2>{about.pastEventsTitle}</h2>
                <p>{about.pastEventsText}</p>
              </div>
              <div className="institutional-card">
                <h2>{about.downloadsTitle}</h2>
                <p>{about.downloadsText}</p>
              </div>
              <div className="institutional-card">
                <h2>{about.policyTitle}</h2>
                <p>{about.policyText}</p>
              </div>
              <div className="institutional-card institutional-card-wide">
                <h2>{about.contactTitle}</h2>
                <p>{about.contactText}</p>
              </div>
            </div>
          </article>

          <article className="content-sheet wide-sheet">
            <h2>{about.adminNoteTitle}</h2>
            <div className="info-banner">{about.adminNoteText}</div>
          </article>
        </section>
      </main>
    </PublicShell>
  );
}
