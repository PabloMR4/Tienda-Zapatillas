import React, { useState } from 'react';
import '../styles/ProductCard.css';

const ProductCard = ({ producto, onProductClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Obtener variantes (soporte formato nuevo y antiguo)
  const variantes = producto.variantes || [];

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(producto);
    }
  };

  // Función para obtener la clase de color según la categoría
  const getCategoryColorClass = () => {
    const rutaCategoria = producto.rutaCategoria || producto.categoria || '';
    const categoriaLower = rutaCategoria.toLowerCase();

    if (categoriaLower.includes('mujer')) {
      return 'category-mujer';
    } else if (categoriaLower.includes('hombre')) {
      return 'category-hombre';
    }
    return '';
  };

  // Obtener TODAS las imágenes del producto (recolectar de todas las variantes)
  const getImagenes = () => {
    const todasImagenes = new Set();

    // Recolectar imágenes de todas las variantes
    if (variantes.length > 0) {
      variantes.forEach(variante => {
        if (variante.imagenes && Array.isArray(variante.imagenes)) {
          variante.imagenes.forEach(img => todasImagenes.add(img));
        }
      });
    }

    // Si no hay imágenes en variantes, usar imágenes directas del producto
    if (todasImagenes.size === 0 && producto.imagenes && producto.imagenes.length > 0) {
      producto.imagenes.forEach(img => todasImagenes.add(img));
    }

    // Si aún no hay imágenes, usar imagen única
    if (todasImagenes.size === 0 && producto.imagen) {
      todasImagenes.add(producto.imagen);
    }

    const imagenesArray = Array.from(todasImagenes);
    return imagenesArray.length > 0 ? imagenesArray : ['https://via.placeholder.com/400x500?text=Sin+Imagen'];
  };

  const imagenes = getImagenes();
  const tieneMultiplesImagenes = imagenes.length > 1;

  // Calcular stock total
  const stockTotal = variantes.reduce((sum, v) => sum + (v.stock || 0), 0);

  // Funciones para navegación del carrusel
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagenes.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imagenes.length) % imagenes.length);
  };

  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: onProductClick ? 'pointer' : 'default' }}>
      {producto.nuevo && <span className="product-badge">Nuevo</span>}
      {producto.descuento && (
        <span className="product-badge discount-badge" style={{
          background: '#f44336',
          right: 'auto',
          left: '15px'
        }}>
          -{producto.descuento.porcentaje}%
        </span>
      )}
      {stockTotal === 0 && (
        <span className="product-badge" style={{
          background: '#9e9e9e',
          right: 'auto',
          left: '15px',
          top: '50px'
        }}>
          Sin Stock
        </span>
      )}

      <div className="product-image-container">
        <img src={imagenes[currentImageIndex]} alt={producto.nombre} className="product-image" />

        {tieneMultiplesImagenes && (
          <>
            <button className="carousel-btn carousel-btn-prev" onClick={prevImage}>
              &#8249;
            </button>
            <button className="carousel-btn carousel-btn-next" onClick={nextImage}>
              &#8250;
            </button>
            <div className="carousel-indicators">
              {imagenes.map((_, index) => (
                <span
                  key={index}
                  className={`carousel-indicator ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{producto.nombre}</h3>
        <p className={`product-category ${getCategoryColorClass()}`}>{producto.rutaCategoria || producto.categoria}</p>

        {/* Mostrar tallas disponibles */}
        {variantes.length > 0 && (
          <div className="tallas-disponibles">
            <span className="tallas-label">Tallas: </span>
            {variantes.map((v, idx) => (
              <span key={v.id} className={`talla-badge ${v.stock === 0 ? 'sin-stock' : ''}`}>
                {v.talla}
                {idx < variantes.length - 1 && ', '}
              </span>
            ))}
          </div>
        )}

        <div className="product-price-container">
          {producto.descuento ? (
            <>
              <p className="product-price discount-price">
                €{producto.descuento.precioConDescuento.toFixed(2)}
              </p>
              <p className="product-price original-price">
                €{producto.precio.toFixed(2)}
              </p>
              <p className="discount-name">{producto.descuento.nombre}</p>
            </>
          ) : (
            <p className="product-price">€{producto.precio.toFixed(2)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
