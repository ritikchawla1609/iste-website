"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GoogleFormModal from "./GoogleFormModal";
import { safeUrl, formatDate } from "@/lib/presentation";

function formatCalendarDates(dateStr) {
  if (!dateStr) return "";
  const clean = dateStr.replace(/-/g, "");
  return `${clean}T090000Z/${clean}T170000Z`;
}

function useCountdown(deadlineStr) {
  const [timeLeft, setTimeLeft] = useState("Loading...");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!deadlineStr) {
      setTimeLeft("No Deadline");
      return;
    }

    function updateTimer() {
      const targetDate = new Date(`${deadlineStr}T23:59:59`);
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft("Closed");
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(" "));
      setIsExpired(false);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadlineStr]);

  return { timeLeft, isExpired };
}

export default function FeaturedEventSection({ featuredEvent }) {
  const [showModal, setShowModal] = useState(false);
  const { timeLeft, isExpired } = useCountdown(featuredEvent?.deadline);
  const registrationUrl = safeUrl(featuredEvent?.registrationLink);

  function handleRegisterClick(e) {
    if (featuredEvent.googleFormLink) {
      e.preventDefault();
      setShowModal(true);
    }
  }

  const mapsUrl = featuredEvent
    ? `https://www.google.com/maps/search/?api=1&query=Chandigarh+University+${encodeURIComponent(featuredEvent.venue)}`
    : "#";

  const googleCalUrl = featuredEvent
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(featuredEvent.name)}&dates=${formatCalendarDates(featuredEvent.eventDate)}&details=${encodeURIComponent(featuredEvent.description)}&location=${encodeURIComponent(featuredEvent.venue)}`
    : "#";

  const outlookCalUrl = featuredEvent
    ? `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(featuredEvent.name)}&body=${encodeURIComponent(featuredEvent.description)}&location=${encodeURIComponent(featuredEvent.venue)}&startdt=${featuredEvent.eventDate}T09:00:00Z&enddt=${featuredEvent.eventDate}T17:00:00Z`
    : "#";

  return (
    <>
      <aside className="whats-new-section inquiry-card" aria-labelledby="whats-new-title">
        <div className="whats-new-hero-card">
          <div className="whats-new-copy">
            <div className="inquiry-card-header">
              <h2 id="whats-new-title" className="whats-new-heading">What's New</h2>
              <div className="inquiry-deadline-tag">Upcoming Event</div>
            </div>

            {featuredEvent ? (
              <>
                <h3 className="featured-event-title">
                  {featuredEvent.name}
                </h3>
                <p className="featured-event-desc">
                  {featuredEvent.description}
                </p>

                {/* Premium Styled Metadata Grid */}
                <div className="featured-event-meta-grid">
                  <div className="event-meta-pill">
                    <small className="meta-pill-label">Date</small>
                    <strong className="meta-pill-value">{formatDate(featuredEvent.eventDate)}</strong>
                  </div>
                  <div className="event-meta-pill">
                    <small className="meta-pill-label">Countdown</small>
                    <strong className={`meta-pill-value ${isExpired ? "countdown-expired" : "countdown-active"}`}>
                      {timeLeft}
                    </strong>
                  </div>
                  <div className="event-meta-pill">
                    <small className="meta-pill-label">Venue</small>
                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="meta-pill-value venue-map-link"
                    >
                      {featuredEvent.venue}
                    </a>
                  </div>
                </div>

                <div className="calendar-integration-box">
                  <span>Add to calendar:</span>
                  <div className="calendar-links">
                    <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className="calendar-link gcal">Google</a>
                    <a href={outlookCalUrl} target="_blank" rel="noopener noreferrer" className="calendar-link ocal">Outlook</a>
                  </div>
                </div>
              </>
            ) : (
              <p className="featured-event-empty-text">
                No upcoming event is published yet. New announcements will appear here
                as soon as they are added in the Upcoming Events section.
              </p>
            )}
          </div>

          {/* Action CTAs inside the spotlight card */}
          <div className="featured-event-actions">
            {featuredEvent && !isExpired && (
              featuredEvent.googleFormLink ? (
                <button 
                  onClick={handleRegisterClick} 
                  className="btn-register-primary"
                  style={{ cursor: 'pointer', border: 'none', font: 'inherit', width: '100%' }}
                >
                  Register Now
                </button>
              ) : (
                registrationUrl && (
                  <a 
                    href={registrationUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-register-primary"
                  >
                    Register Now
                  </a>
                )
              )
            )}
            
            {featuredEvent && isExpired && (
              <button 
                disabled 
                className="btn-register-primary disabled-btn"
                style={{ cursor: 'not-allowed', opacity: 0.5 }}
              >
                Registration Closed
              </button>
            )}

            <Link href="/events" className="btn-view-all-secondary">
              View All Events
            </Link>
          </div>
        </div>
      </aside>

      {featuredEvent && (
        <GoogleFormModal 
          open={showModal} 
          onClose={() => setShowModal(false)} 
          formUrl={featuredEvent.googleFormLink} 
          eventName={featuredEvent.name} 
        />
      )}
    </>
  );
}
