import React, { useEffect, useState } from 'react';
import '../styles/Hero.css';

const Hero = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const scrollToCollection = () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home">
      <div className="hero-overlay"></div>
      <div className={`hero-content ${visible ? 'visible' : ''}`}>
        <span className="hero-subtitle">Colección Primavera 2024</span>
        <h1 className="hero-title">
          Elegancia <br />
          <span className="hero-title-accent">Atemporal</span>
        </h1>
        <p className="hero-description">
          Descubre zapatillas premium y bolsos exclusivos de lujo.
          Diseños únicos para personas con estilo excepcional.
        </p>
        <button className="hero-button" onClick={scrollToCollection}>
          Explorar Colección
        </button>
      </div>
      <div className="hero-scroll-indicator">
        <span>Desliza</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
};

export default Hero;
