import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { obtenerProductos } from '../services/api';
import '../styles/ProductGrid.css';

const ProductGrid = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const sliderRefs = useRef({});

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

    return destacados;
  };

  // Obtener categorías únicas de los productos (excluyendo destacados)
  const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];

  const getProductosPorCategoria = (categoria) => {
    return productos.filter(p => p.categoria === categoria).slice(0, 4);
  };

  const formatearNombreCategoria = (categoria) => {
    // Capitalizar primera letra de cada palabra
    return categoria
      .split(/[-\s]+/)
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  const scrollSlider = (categoria, direction) => {
    const slider = sliderRefs.current[categoria];
    if (slider) {
      const scrollAmount = 320; // ancho de la card + gap
      slider.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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

  const productosDestacados = getProductosDestacados();

  return (
    <section className="product-section" id="collection">
      {/* Sección de Productos Destacados */}
      {productosDestacados.length > 0 && (
        <div key="destacados" className="category-section">
          <div className="category-header">
            <h3 className="category-title">Productos Destacados</h3>
            <div className="slider-controls">
              <button
                className="slider-btn slider-btn-left"
                onClick={() => scrollSlider('destacados', 'left')}
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                className="slider-btn slider-btn-right"
                onClick={() => scrollSlider('destacados', 'right')}
                aria-label="Siguiente"
              >
                ›
              </button>
            </div>
          </div>

          <div
            className="product-slider"
            ref={el => sliderRefs.current['destacados'] = el}
          >
            {productosDestacados.map((producto) => (
              <div
                key={producto.id}
                className="product-slider-item"
              >
                <ProductCard
                  producto={producto}
                  onProductClick={() => setSelectedProduct(producto)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resto de categorías */}
      {categoriasUnicas.map(categoria => {
        const productosCategoria = getProductosPorCategoria(categoria);

        if (productosCategoria.length === 0) return null;

        return (
          <div key={categoria} className="category-section">
            <div className="category-header">
              <h3 className="category-title">{formatearNombreCategoria(categoria)}</h3>
              <div className="slider-controls">
                <button
                  className="slider-btn slider-btn-left"
                  onClick={() => scrollSlider(categoria, 'left')}
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  className="slider-btn slider-btn-right"
                  onClick={() => scrollSlider(categoria, 'right')}
                  aria-label="Siguiente"
                >
                  ›
                </button>
              </div>
            </div>

            <div
              className="product-slider"
              ref={el => sliderRefs.current[categoria] = el}
            >
              {productosCategoria.map((producto) => (
                <div
                  key={producto.id}
                  className="product-slider-item"
                >
                  <ProductCard
                    producto={producto}
                    onProductClick={() => setSelectedProduct(producto)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {selectedProduct && (
        <ProductModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
};

export default ProductGrid;
