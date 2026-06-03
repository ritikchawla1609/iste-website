"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/presentation";

export default function PastEventsClient({ events }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");

  // Get all unique categories dynamically
  const categories = ["All", ...Array.from(new Set(events.map(e => e.category || "Event")))];

  // Auto-play slideshow logic
  useEffect(() => {
    if (!selectedEvent || !selectedEvent.imagePaths || selectedEvent.imagePaths.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveSlideIndex((prevIndex) => (prevIndex + 1) % selectedEvent.imagePaths.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedEvent]);

  // Deep linking: read eventId query parameter on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const eventIdParam = searchParams.get("eventId");
    if (eventIdParam) {
      const match = events.find(e => String(e.id) === String(eventIdParam));
      if (match) {
        setSelectedEvent(match);
        setActiveSlideIndex(0);
        document.body.style.overflow = "hidden";
      }
    }
  }, [events]);

  // Clean up body overflow when unmounting
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setActiveSlideIndex(0);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";
    // Update URL path parameters for deep-linking
    const newUrl = `${window.location.pathname}?eventId=${event.id}`;
    window.history.pushState(null, "", newUrl);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    document.body.style.overflow = "";
    // Reset URL search parameters
    window.history.pushState(null, "", window.location.pathname);
  };

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    if (!selectedEvent || !selectedEvent.imagePaths) return;
    setActiveSlideIndex((prevIndex) => 
      prevIndex === 0 ? selectedEvent.imagePaths.length - 1 : prevIndex - 1
    );
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    if (!selectedEvent || !selectedEvent.imagePaths) return;
    setActiveSlideIndex((prevIndex) => 
      (prevIndex + 1) % selectedEvent.imagePaths.length
    );
  };

  const handleDotClick = (index, e) => {
    e.stopPropagation();
    setActiveSlideIndex(index);
  };

  // Filter events based on active category selection
  const filteredEvents = activeCategory === "All"
    ? events
    : events.filter(e => (e.category || "Event").toLowerCase() === activeCategory.toLowerCase());

  return (
    <>
      <section className="past-events-grid" style={{ marginTop: '24px' }}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, eventIndex) => {
            const hasImages = event.imagePaths && event.imagePaths.length > 0;
            const coverImage = hasImages ? (event.imagePaths[0].startsWith("http") ? event.imagePaths[0] : `/${event.imagePaths[0]}`) : null;

            return (
              <article
                key={event.id}
                className={`content-sheet past-event-card ${hasImages ? "has-bg" : ""}`}
                style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
                onClick={() => handleOpenModal(event)}
              >
                {hasImages && <div className="card-bg-overlay" />}
                <div className="past-event-content-wrapper">
                  <div className="past-event-topline">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p className="section-kicker">{formatDate(event.eventDate)}</p>
                      <span className="card-category-badge">{event.category || "Event"}</span>
                    </div>
                    <span>{String(eventIndex + 1).padStart(2, "0")}</span>
                  </div>
                  <h2>{event.name}</h2>
                  <p className="listing-copy">{event.description}</p>

                  {event.winners && (
                    <div className="past-event-highlight">
                      <strong>Highlights</strong>
                      <p>{event.winners}</p>
                    </div>
                  )}
                  
                  {hasImages && (
                    <span className="card-view-details-kicker">
                      Click to view {event.imagePaths.length} event photos & details →
                    </span>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No historical events found under this category.</p>
          </div>
        )}
      </section>

      {selectedEvent && (
        <div className="event-modal-overlay" onClick={handleCloseModal}>
          <div className="event-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="event-modal-close-btn" onClick={handleCloseModal} aria-label="Close modal">
              ✕
            </button>

            {/* Top Carousel Slideshow */}
            {selectedEvent.imagePaths && selectedEvent.imagePaths.length > 0 ? (
              <div className="modal-slideshow-container">
                <div className="modal-slideshow-wrapper">
                  {selectedEvent.imagePaths.map((path, idx) => {
                    const imgUrl = path.startsWith("http") ? path : `/${path}`;
                    return (
                      <div
                        key={idx}
                        className={`modal-slide ${idx === activeSlideIndex ? "active" : ""}`}
                        style={{ backgroundImage: `url(${imgUrl})` }}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`${selectedEvent.name} photo ${idx + 1}`} 
                          className="modal-slide-img-hidden" 
                        />
                      </div>
                    );
                  })}
                </div>

                {selectedEvent.imagePaths.length > 1 && (
                  <>
                    <button className="slideshow-arrow prev" onClick={handlePrevSlide}>
                      ‹
                    </button>
                    <button className="slideshow-arrow next" onClick={handleNextSlide}>
                      ›
                    </button>
                    <div className="slideshow-dots">
                      {selectedEvent.imagePaths.map((_, idx) => (
                        <button
                          key={idx}
                          className={`slideshow-dot ${idx === activeSlideIndex ? "active" : ""}`}
                          onClick={(e) => handleDotClick(idx, e)}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* Modal Body Contents */}
            <div className="event-modal-body">
              <header className="event-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className="event-modal-date-badge">{formatDate(selectedEvent.eventDate)}</span>
                  <span style={{ padding: '4px 10px', borderRadius: '50px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.72rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {selectedEvent.category || "Event"}
                  </span>
                </div>
                <h1 className="event-modal-title">
                  {selectedEvent.name}
                </h1>
              </header>

              <section className="event-modal-info-section">
                <div className="event-modal-description">
                  <h3>About the Event</h3>
                  <p>{selectedEvent.description}</p>
                </div>

                {selectedEvent.winners && (
                  <div className="event-modal-achievements">
                    <h3>Achievements & Highlights</h3>
                    <div className="achievements-trophy-card">
                      <div className="trophy-glow" />
                      <div className="trophy-card-header">
                        <span className="trophy-icon">🏆</span>
                        <h4>Highlights</h4>
                      </div>
                      <p>{selectedEvent.winners}</p>
                    </div>
                  </div>
                )}
              </section>

              {/* Gallery Section */}
              {selectedEvent.imagePaths && selectedEvent.imagePaths.length > 0 && (
                <section className="event-modal-gallery-section">
                  <h3>Event Photo Gallery</h3>
                  <div className="event-modal-gallery-grid">
                    {selectedEvent.imagePaths.map((path, idx) => {
                      const imgUrl = path.startsWith("http") ? path : `/${path}`;
                      return (
                        <div 
                          key={idx} 
                          className={`gallery-thumbnail-card ${idx === activeSlideIndex ? "active-thumbnail" : ""}`}
                          onClick={() => setActiveSlideIndex(idx)}
                        >
                          <img
                            src={imgUrl}
                            alt={`${selectedEvent.name} thumbnail ${idx + 1}`}
                            loading="lazy"
                          />
                          <div className="gallery-thumbnail-hover-overlay">
                            <span>View</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
