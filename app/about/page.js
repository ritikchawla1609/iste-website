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

          <div className="about-main-card">
            <div className="card-header-accent"></div>
            
            <div className="about-section-block">
              <h2>{about.overviewTitle}</h2>
              <div className="about-content-body">
                <p>{about.overviewParagraphOne}</p>
                <p>{about.overviewParagraphTwo}</p>
                <p>{about.heroText}</p>
              </div>
            </div>
            
            <div className="about-section-block">
              <h3>{about.visionTitle}</h3>
              <ul className="detail-list">
                {about.visionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="about-section-block">
              <h3>{about.focusTitle}</h3>
              <div className="focus-grid">
                {about.focusCards.map((card, index) => (
                  <div className="focus-card" key={card.title}>
                    <span className="focus-card-index">{String(index + 1).padStart(2, "0")}</span>
                    <h4>{card.title}</h4>
                    <p>{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="about-team-section">
          <div className="team-container">

            <div className="team-group">
              <div className="about-team-cta-banner">
                <p className="hero-kicker">Our Team</p>
                <h2>Meet the Visionaries</h2>
                <p>
                  Our chapter is powered by a dedicated team of faculty advisors, office bearers, and domain leads 
                  who work tirelessly to foster technical growth and innovation.
                </p>
                <Link 
                  href="/team" 
                  className="btn-premium-primary"
                >
                  View Full Team Structure
                </Link>
              </div>
            </div>

          </div>
        </section>
            </main>
            </PublicShell>
            );
            }
