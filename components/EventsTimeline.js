"use client";

import { useState, useEffect } from "react";
import { safeUrl } from "@/lib/presentation";

function formatCalendarDates(dateStr) {
  if (!dateStr) return "";
  const clean = dateStr.replace(/-/g, "");
  return `${clean}T090000Z/${clean}T170000Z`;
}

// Custom hook to calculate individual event countdowns
function EventCountdown({ deadlineStr }) {
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

  return (
    <div className="timeline-countdown-box">
      <span className="countdown-label">Registration: </span>
      <strong className={isExpired ? "expired-text" : "active-text"}>{timeLeft}</strong>
    </div>
  );
}

export default function EventsTimeline({ events }) {

  return (
    <>
      <section className="timeline-section">
        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          {events.length ? (
            events.map((event, index) => {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=Chandigarh+University+${encodeURIComponent(event.venue)}`;
              const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatCalendarDates(event.eventDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;
              const outlookCalUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(event.name)}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}&startdt=${event.eventDate}T09:00:00Z&enddt=${event.eventDate}T17:00:00Z`;
              const isEventClosed = event.deadline ? new Date(`${event.deadline}T23:59:59`) < new Date() : false;
              const registrationUrl = safeUrl(event.registrationLink);

              return (
                <div key={event.id} className="timeline-item left">
                  <div className="timeline-dot"></div>
                  
                  <div className="timeline-info">
                    <div className="time-badge">{event.timing}</div>
                    <h2 className="event-title">{event.name}</h2>
                    <p className="event-desc">{event.description}</p>
                    
                    <EventCountdown deadlineStr={event.deadline} />

                    <div className="event-stats-grid">
                      <div className="stat-box">
                        <span className="stat-icon">01</span>
                        <div className="stat-copy">
                          <small>Participants</small>
                          <strong>
                            {event.minTeamSize === event.maxTeamSize 
                              ? (event.minTeamSize === 1 ? "Individual" : `${event.minTeamSize} Members`) 
                              : `${event.minTeamSize}-${event.maxTeamSize} Members`}
                          </strong>
                        </div>
                      </div>
                      <div className="stat-box">
                        <span className="stat-icon">02</span>
                        <div className="stat-copy">
                          <small>Prize Pool</small>
                          <strong>{event.prizes}</strong>
                        </div>
                      </div>
                      <div className="stat-box">
                        <span className="stat-icon">03</span>
                        <div className="stat-copy">
                          <small>Registration Fees</small>
                          <strong>{event.registrationFee || "Free"}</strong>
                        </div>
                      </div>
                      <div className="stat-box">
                        <span className="stat-icon">04</span>
                        <div className="stat-copy">
                          <small>Location</small>
                          <a 
                            href={mapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="timeline-venue-link"
                          >
                            <strong>{event.venue}</strong>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="timeline-calendar-box">
                      <span>Add to Calendar:</span>
                      <div className="timeline-calendar-buttons">
                        <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className="cal-btn gcal">Google</a>
                        <a href={outlookCalUrl} target="_blank" rel="noopener noreferrer" className="cal-btn ocal">Outlook</a>
                      </div>
                    </div>

                    <div className="event-actions" style={{ marginTop: '20px' }}>
                      {isEventClosed ? (
                        <button 
                          disabled 
                          className="primary-btn disabled-btn"
                          style={{ cursor: 'not-allowed', opacity: 0.5, flex: 1 }}
                        >
                          Registration Closed
                        </button>
                      ) : (
                        <a 
                          href={registrationUrl || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="primary-btn"
                          style={{ flex: 1 }}
                        >
                          Apply Now
                        </a>
                      )}

                      {event.googleFormLink && (
                        <a 
                          href={safeUrl(event.googleFormLink) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="secondary-btn"
                          style={{ flex: 1 }}
                        >
                          Feedback Form
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="timeline-poster">
                    <div className="poster-wrapper">
                      <img
                        src={
                          event.posterPath
                            ? event.posterPath.startsWith("http")
                              ? event.posterPath
                              : `/${event.posterPath}`
                            : "/brand/iste-logo.jpg"
                        }
                        alt={event.name}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '100px 0' }}>
              <p>No upcoming events scheduled yet.</p>
            </div>
          )}
        </div>
      </section>


    </>
  );
}
