"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/presentation";

function PastEventCard({ event, eventIndex, onOpenModal }) {
  const [activeBgIndex, setActiveBgIndex] = useState(0);
  const hasImages = event.imagePaths && event.imagePaths.length > 0;

  useEffect(() => {
    if (!hasImages || event.imagePaths.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % event.imagePaths.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [hasImages, event.imagePaths]);

  return (
    <article
      className={`content-sheet past-event-card ${hasImages ? "has-bg" : ""}`}
      onClick={() => onOpenModal(event)}
    >
      {hasImages && (
        <div className="card-slideshow-bg">
          {event.imagePaths.map((path, idx) => {
            const imgUrl = path.startsWith("http") ? path : `/${path}`;
            return (
              <div
                key={idx}
                className={`card-bg-slide ${idx === activeBgIndex ? "active" : ""}`}
                style={{ backgroundImage: `url(${imgUrl})` }}
              />
            );
          })}
          <div className="card-bg-overlay" />
        </div>
      )}
      <div className="past-event-content-wrapper">
        <div className="past-event-topline">
          <h2 className="past-event-name-heading">{event.name}</h2>
          <span className="past-event-index">{String(eventIndex + 1).padStart(2, "0")}</span>
        </div>
        
        <div className="past-event-date-subheading">
          <svg className="calendar-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>{formatDate(event.eventDate)}</span>
        </div>

        <p className="listing-copy">{event.description}</p>

        <div className="past-event-action-link">
          <span>{hasImages ? `View Gallery (${event.imagePaths.length} Photos)` : "Explore Highlights"}</span>
          <svg className="action-arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
      </div>
    </article>
  );
}

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
          filteredEvents.map((event, eventIndex) => (
            <PastEventCard
              key={event.id}
              event={event}
              eventIndex={eventIndex}
              onOpenModal={handleOpenModal}
            />
          ))
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
            <div className="event-modal-body" style={{ paddingTop: (!selectedEvent.imagePaths || selectedEvent.imagePaths.length === 0) ? '48px' : undefined }}>
              <header className="event-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className="event-modal-date-badge">
                    <svg className="calendar-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px', verticalAlign: 'middle', display: 'inline-block', marginTop: '-2px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {formatDate(selectedEvent.eventDate)}
                  </span>
                </div>
                <h1 className="event-modal-title">
                  {selectedEvent.name}
                </h1>
              </header>

              {/* Achievements & Highlights Spotlight (Full Width, Placed Upper) */}
              {selectedEvent.winners && (
                <div className="event-modal-highlight-hero">
                  <div className="highlight-glow-bg" />
                  <div className="highlight-hero-body">
                    <div className="highlight-left-content">
                      <div className="highlight-badge">
                        <span style={{ marginRight: '5px' }}>✨</span>
                        <span>Achievements & Highlights</span>
                      </div>
                      <p>{selectedEvent.winners}</p>
                    </div>
                    <div className="highlight-right-trophy">
                      <div className="trophy-circle-bg">
                        <span className="floating-trophy-emoji">🏆</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <section className="event-modal-info-section">
                <div className="event-modal-description">
                  <h3>About the Event</h3>
                  <p>{selectedEvent.description}</p>
                </div>
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
