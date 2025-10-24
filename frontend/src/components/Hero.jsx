import React, { useEffect, useState } from 'react';
import '../styles/Hero.css';

const Hero = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero-overlay"></div>
      <div className={`hero-content ${visible ? 'visible' : ''}`}>
        <span className="hero-subtitle">Colección Exclusiva de Otoño 2025</span>
        <h1 className="hero-title">
          Estilo <br />
          <span className="hero-title-accent">En Cada Paso</span>
        </h1>
        <p className="hero-description">
          Descubre las mejores zapatillas premium y accesorios de calidad superior.
          Diseños únicos para personas con estilo excepcional.
        </p>
        <div className="halloween-badge">
          <span className="halloween-icon">🎃</span>
          <span className="halloween-text">Halloween - Descuento 10% en todos los productos</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
