import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HeroHeader.css';

const HeroHeader = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'mujer',
      title: 'Mujer',
      subtitle: 'Elegancia y estilo',
      image: 'https://i.ibb.co/xMkVthy/mujer-zapatos.jpg',
      categoria: 'mujer'
    },
    {
      id: 'hombre',
      title: 'Hombre',
      subtitle: 'Distinción en cada paso',
      image: 'https://i.ibb.co/sKq9YNT/hombre-zapatos.jpg',
      categoria: 'hombre'
    },
    {
      id: 'complementos',
      title: 'Complementos',
      subtitle: 'El toque perfecto',
      image: 'https://i.ibb.co/0BNqhSm/complementos.jpg',
      categoria: 'complementos'
    }
  ];

  return (
    <section className="hero-header">
      {/* Cabecera principal */}
      <div className="hero-header-title">
        <h1>Nueva Colección</h1>
        <p>Descubre lo último en calzado premium</p>
      </div>

      {/* Secciones de categorías */}
      <div className="hero-sections-grid">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`hero-section-card hero-section-${index + 1}`}
            onClick={() => navigate(`/categoria/${section.categoria}`)}
          >
            <div className="hero-section-image">
              <img src={section.image} alt={section.title} />
              <div className="hero-section-overlay"></div>
            </div>
            <div className="hero-section-content">
              <h2 className="hero-section-title">{section.title}</h2>
              <p className="hero-section-subtitle">{section.subtitle}</p>
              <button className="hero-section-btn">
                Descubrir
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroHeader;
