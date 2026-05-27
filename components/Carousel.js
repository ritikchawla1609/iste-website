"use client";

import { useState, useEffect } from "react";

const carouselItems = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
    title: "Innovation & Excellence",
    description: "Empowering students through technical education."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop",
    title: "Collaborative Learning",
    description: "Join a community of passionate learners and innovators."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop",
    title: "Technical Workshops",
    description: "Hands-on experience with the latest technologies."
  }
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselItems.length) % carouselItems.length);
  };

  return (
    <div className="home-carousel">
      {carouselItems.map((item, index) => (
        <div
          key={item.id}
          className={`carousel-slide ${index === currentIndex ? "active" : ""}`}
        >
          <div 
            className="carousel-bg" 
            style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.7)), url(${item.image})` }}
          />
          <div className="carousel-content">
            <h2 className="carousel-title">{item.title}</h2>
            <p className="carousel-description">{item.description}</p>
          </div>
        </div>
      ))}
      
      <button className="carousel-control prev" onClick={prevSlide} aria-label="Previous Slide">
        &#10094;
      </button>
      <button className="carousel-control next" onClick={nextSlide} aria-label="Next Slide">
        &#10095;
      </button>
 
      <div className="carousel-dots">
        {carouselItems.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}
