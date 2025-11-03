import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import EthicalBanner from './EthicalBanner';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { obtenerProductos } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // Obtener productos destacados (1 por categoría)
  const getProductosDestacados = () => {
    const categorias = [...new Set(productos.map(p => p.categoria))];
    const destacados = [];

    categorias.forEach(categoria => {
      const destacado = productos.find(p => p.categoria === categoria && p.destacado);
      if (destacado) {
        destacados.push(destacado);
      }
    });

    return destacados.slice(0, 6); // Máximo 6 productos destacados
  };

  // Obtener categorías con sus productos
  const getCategorias = () => {
    const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];
    return categoriasUnicas.map(categoria => {
      const productosCategoria = productos.filter(p => p.categoria === categoria);
      return {
        nombre: categoria,
        total: productosCategoria.length,
        imagen: productosCategoria[0]?.variantes?.[0]?.imagenes?.[0] || productosCategoria[0]?.imagenes?.[0]
      };
    }); // Mostrar TODAS las categorías
  };

  const productosDestacados = getProductosDestacados();
  const categorias = getCategorias();

  const formatearNombreCategoria = (categoria) => {
    return categoria
      .split(/[-\s]+/)
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <>
        <Hero />
        <div className="loading-home">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Hero />

      {/* Sección de Productos Destacados */}
      {productosDestacados.length > 0 && (
        <section className="featured-section">
          <div className="section-container">
            <div className="section-header-home">
              <span className="section-tag">Lo Mejor</span>
              <h2 className="section-title-home">Productos Destacados</h2>
              <p className="section-description-home">
                Nuestra selección premium de calzado exclusivo
              </p>
            </div>

            <div className="featured-grid">
              {productosDestacados.map((producto) => (
                <div key={producto.id} className="featured-item">
                  <ProductCard
                    producto={producto}
                    onProductClick={() => setSelectedProduct(producto)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sección de Categorías */}
      {categorias.length > 0 && (
        <section className="categories-home-section">
          <div className="section-container">
            <div className="section-header-home">
              <span className="section-tag">Explora</span>
              <h2 className="section-title-home">Categorías</h2>
              <p className="section-description-home">
                Encuentra el estilo perfecto para cada ocasión
              </p>
            </div>

            <div className="categories-home-grid">
              {categorias.map((categoria, index) => (
                <div
                  key={index}
                  className={`category-home-card category-card-${index + 1}`}
                  onClick={() => navigate(`/categoria/${categoria.nombre}`)}
                >
                  <div className="category-home-image">
                    {categoria.imagen && (
                      <img src={categoria.imagen} alt={categoria.nombre} />
                    )}
                    <div className="category-home-overlay"></div>
                  </div>
                  <div className="category-home-content">
                    <h3 className="category-home-name">
                      {formatearNombreCategoria(categoria.nombre)}
                    </h3>
                    <p className="category-home-count">
                      {categoria.total} productos
                    </p>
                    <button className="category-home-btn">
                      Explorar
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sección de Moda Ética */}
      <EthicalBanner />

      {/* Sección de Personalización de Vans */}
      <section className="vans-promo-section">
        <div className="vans-promo-container">
          <div className="vans-promo-content">
            <span className="vans-promo-tag">Servicio Premium</span>
            <h2 className="vans-promo-title">Personalización Exclusiva de Vans</h2>
            <p className="vans-promo-description">
              Convierte tus ideas en realidad con nuestro servicio de personalización premium.
              Diseña tus Vans únicas con materiales de alta calidad, colores exclusivos y
              detalles artesanales. Cada par es una obra de arte creada especialmente para ti.
            </p>
            <div className="vans-promo-features">
              <div className="vans-promo-feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Materiales Premium</span>
              </div>
              <div className="vans-promo-feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                </svg>
                <span>Diseño 100% Personalizado</span>
              </div>
              <div className="vans-promo-feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <span>Confección Artesanal</span>
              </div>
            </div>
            <button className="vans-promo-btn" onClick={() => navigate('/vans-custom')}>
              Diseña tus Vans
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div className="vans-promo-image">
            <img
              src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80"
              alt="Vans Personalizadas"
            />
          </div>
        </div>
      </section>

      {/* Modal de Producto */}
      {selectedProduct && (
        <ProductModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default Home;
