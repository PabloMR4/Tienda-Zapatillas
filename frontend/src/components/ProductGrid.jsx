import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { obtenerProductos } from '../services/api';
import '../styles/ProductGrid.css';

const ProductGrid = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorias = ['todos', 'zapatillas', 'bolsos'];

  const productosFiltrados = filter === 'todos'
    ? productos
    : productos.filter(p => p.categoria === filter);

  if (loading) {
    return (
      <section className="product-section" id="collection">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-section" id="collection">
      <div className="section-header">
        <span className="section-subtitle">Descubre</span>
        <h2 className="section-title">Nuestra Colección</h2>
        <p className="section-description">
          Zapatillas y bolsos exclusivos para complementar tu estilo
        </p>
      </div>

      <div className="filter-buttons">
        {categorias.map(categoria => (
          <button
            key={categoria}
            className={`filter-btn ${filter === categoria ? 'active' : ''}`}
            onClick={() => setFilter(categoria)}
          >
            {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {productosFiltrados.map((producto, index) => (
          <div
            key={producto.id}
            className="product-grid-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ProductCard producto={producto} />
          </div>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <div className="no-products">
          <p>No hay productos en esta categoría</p>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
