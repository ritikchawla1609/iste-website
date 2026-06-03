"use client";

import { useState, useEffect } from "react";

const carouselItems = [
  {
    id: 1,
    image: "/team/carousel/c1.jpeg",
    title: "Innovation & Excellence",
    description: "Empowering students through technical leadership and professional growth."
  },
  {
    id: 2,
    image: "/team/carousel/c4.jpeg",
    title: "Collaborative Learning",
    description: "Building a vibrant community of active learners, developers, and future leaders."
  },
  {
    id: 3,
    image: "/team/carousel/c2.jpeg",
    title: "Hackathons & Competitions",
    description: "Fostering competitive spirit and problem-solving through hands-on technical contests."
  },
  {
    id: 4,
    image: "/team/carousel/c5.jpeg",
    title: "Interactive Sessions",
    description: "Presenting ideas, demonstrating projects, and getting mentored by industry experts."
  },
  {
    id: 5,
    image: "/team/carousel/c3.jpeg",
    title: "Chapter Milestones",
    description: "Organizing major seminars, official events, and national chapter programs."
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
