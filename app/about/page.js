import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { getPublicSiteData } from "@/lib/site";
import Carousel from "@/components/Carousel";

export const revalidate = 60;

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
        <section className="about-consolidated-section">
          <Carousel />

          <div style={{ marginTop: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Link
              href="/team"
              className="about-visionaries-btn glass-btn"
            >
              <span className="btn-text-large">Meet the Visionaries</span>
              <span className="btn-text-medium">Meet Visionaries</span>
              <span className="btn-text-small">Meet Team</span>
            </Link>
          </div>

          <div className="about-main-card">
            <div className="card-header-accent"></div>

            <div className="about-section-block">
              <h2>{about.overviewTitle}</h2>
              <div className="about-content-body">
                <p>{about.overviewParagraphOne}</p>
                <p>{about.overviewParagraphTwo}</p>

              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
