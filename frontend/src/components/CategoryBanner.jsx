import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProductos } from '../services/api';
import '../styles/CategoryBanner.css';

const CategoryBanner = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const productos = await obtenerProductos();
      const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];

      // Mapear categorías con imágenes de ejemplo
      const categoriasConImagenes = categoriasUnicas.map((cat, index) => {
        const productosCategoria = productos.filter(p => p.categoria === cat);
        const imagenCategoria = productosCategoria[0]?.variantes?.[0]?.imagenes?.[0] ||
                                productosCategoria[0]?.imagenes?.[0] ||
                                `https://images.unsplash.com/photo-${1543163521 + index * 1000000}-1bf539c55dd2?w=800&h=1200&fit=crop`;

        return {
          id: cat,
          title: cat,
          image: imagenCategoria,
          categoria: cat
        };
      });

      setCategories(categoriasConImagenes);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const formatearNombreCategoria = (categoria) => {
    return categoria
      .split(/[-\s]+/)
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  return (
    <section className="category-banner">
      <div className="category-banner-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-banner-item"
            onClick={() => navigate(`/categoria/${category.categoria}`)}
          >
            <div className="category-banner-image">
              <img src={category.image} alt={category.title} />
              <div className="category-banner-overlay"></div>
            </div>
            <div className="category-banner-content">
              <h3 className="category-banner-title">{formatearNombreCategoria(category.title)}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryBanner;
