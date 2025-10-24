import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { obtenerProductos } from '../services/api';
import '../styles/CategoryPage.css';

const CategoryPage = () => {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categoriasNombres = {
    'todos': 'Todos',
    'deportivas': 'Deportivas/Sneakers',
    'botines': 'Botines',
    'botas': 'Botas',
    'zapatos': 'Zapatos'
  };

  useEffect(() => {
    cargarProductos();
    window.scrollTo(0, 0);
  }, [categoria]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = categoria === 'todos'
    ? productos
    : productos.filter(p => p.categoria === categoria);

  if (loading) {
    return (
      <div className="category-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Volver al inicio
        </button>
        <h1 className="category-title">{categoriasNombres[categoria] || categoria}</h1>
        <p className="category-description">
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
        </p>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="no-products">
          <p>No hay productos disponibles en esta categoría</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Ver todas las categorías
          </button>
        </div>
      ) : (
        <div className="category-product-grid">
          {productosFiltrados.map((producto, index) => (
            <div
              key={producto.id}
              className="category-grid-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard
                producto={producto}
                onProductClick={() => setSelectedProduct(producto)}
              />
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default CategoryPage;
