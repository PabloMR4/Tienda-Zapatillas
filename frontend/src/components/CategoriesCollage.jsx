import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CategoriesCollage.css';

const CategoriesCollage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Deportivas/Sneakers',
      description: 'Estilo urbano y confort',
      filterValue: 'deportivas'
    },
    {
      name: 'Botines',
      description: 'Elegancia para cada paso',
      filterValue: 'botines'
    },
    {
      name: 'Botas',
      description: 'Para todas las estaciones',
      filterValue: 'botas'
    },
    {
      name: 'Zapatos',
      description: 'Sofisticación diaria',
      filterValue: 'zapatos'
    },
    {
      name: 'Ver Todos',
      description: 'Toda nuestra colección',
      filterValue: 'todos'
    }
  ];

  return (
    <section className="categories-section">
      <div className="section-header">
        <span className="section-subtitle">Explora</span>
        <h2 className="section-title">Categorías</h2>
        <p className="section-description">
          Encuentra el estilo perfecto para cada ocasión
        </p>
      </div>

      <div className="categories-collage">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`category-item category-item-${index + 1}`}
            onClick={() => navigate(`/categoria/${category.filterValue}`)}
          >
            <div className="category-overlay"></div>
            <div className="category-content">
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
              <span className="category-arrow">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesCollage;
