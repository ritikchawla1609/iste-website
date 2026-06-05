"use client";

import { useState, useEffect } from "react";

export default function PastEventsHeroCarousel({ imagePaths }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!imagePaths || imagePaths.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [imagePaths]);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + imagePaths.length) % imagePaths.length);
  };

  const hasImages = Array.isArray(imagePaths) && imagePaths.length > 0;

  return (
    <section className={`subpage-premium-hero past-events-hero-panel ${hasImages ? "has-carousel" : ""}`}>
      {hasImages && (
        <div className="hero-slideshow-bg">
          {imagePaths.map((path, index) => {
            const imageUrl = path.startsWith("http") ? path : `/${path}`;
            return (
              <div
                key={path}
                className={`hero-slide ${index === currentIndex ? "active" : ""}`}
                style={{ 
                  backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.7)), url(${imageUrl})`
                }}
              />
            );
          })}
        </div>
      )}

      <div className="subpage-hero-copy">
        <h1 className="subpage-premium-title">
          Previous Events & <span>Achievements</span>
        </h1>
        <p className="subpage-premium-desc">
          Celebrating milestones, success stories, and technical breakthroughs from the
          ISTE Student Chapter at Chandigarh University.
        </p>
      </div>

      {hasImages && imagePaths.length > 1 && (
        <>
          <button className="carousel-control prev" onClick={prevSlide} aria-label="Previous Slide">
            &#10094;
          </button>
          <button className="carousel-control next" onClick={nextSlide} aria-label="Next Slide">
            &#10095;
          </button>
          <div className="carousel-dots">
            {imagePaths.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              ></span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
