import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ProductModal.css';

const ProductModal = ({ producto, onClose }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [notification, setNotification] = useState('');
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);

  if (!producto) return null;

  const variantes = producto.variantes || [];
  const stockTotal = variantes.reduce((sum, v) => sum + (v.stock || 0), 0);

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
    return imagenesArray.length > 0 ? imagenesArray : ['https://via.placeholder.com/600x800?text=Sin+Imagen'];
  };

  const imagenes = getImagenes();

  const handleVariantSelect = (variante) => {
    if (variante.stock > 0) {
      setSelectedVariant(variante);
      // NO cambiamos currentImageIndex - las imágenes no cambian con la talla
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setNotification('Por favor, selecciona una talla');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    addToCart(producto, selectedVariant);
    setNotification(`¡Añadido al carrito! ${producto.nombre} - Talla ${selectedVariant.talla}`);
    setTimeout(() => {
      setNotification('');
      onClose();
    }, 1500);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagenes.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  // Funciones para el zoom
  const handleMouseMove = (e) => {
    if (!isZooming) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)',
    });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({
      transform: 'scale(1)',
    });
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-body">
          {/* Galería de imágenes */}
          <div className="modal-gallery">
            <div className="modal-main-image">
              <img
                src={imagenes[currentImageIndex]}
                alt={producto.nombre}
                style={zoomStyle}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={isZooming ? 'zooming' : ''}
              />
              {imagenes.length > 1 && (
                <>
                  <button className="modal-carousel-btn modal-prev" onClick={prevImage}>
                    &#8249;
                  </button>
                  <button className="modal-carousel-btn modal-next" onClick={nextImage}>
                    &#8250;
                  </button>
                  <div className="modal-image-indicator">
                    {currentImageIndex + 1} / {imagenes.length}
                  </div>
                </>
              )}
            </div>
            {imagenes.length > 1 && (
              <div className="modal-thumbnails">
                {imagenes.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${producto.nombre} ${idx + 1}`}
                    className={`modal-thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="modal-info">
            {producto.nuevo && <span className="modal-badge">Nuevo</span>}
            {producto.descuento && (
              <span className="modal-badge discount-badge">
                -{producto.descuento.porcentaje}%
              </span>
            )}

            <h2 className="modal-title">{producto.nombre}</h2>
            <p className={`modal-category ${getCategoryColorClass()}`}>
              {producto.rutaCategoria || producto.categoria}
            </p>

            <div className="modal-price-section">
              {producto.descuento ? (
                <div className="modal-price-container">
                  <span className="modal-price discount-price">
                    €{producto.descuento.precioConDescuento.toFixed(2)}
                  </span>
                  <span className="modal-price original-price">
                    €{producto.precio.toFixed(2)}
                  </span>
                  <span className="modal-discount-name">{producto.descuento.nombre}</span>
                </div>
              ) : (
                <span className="modal-price">€{producto.precio.toFixed(2)}</span>
              )}
            </div>

            <p className="modal-description">{producto.descripcion}</p>

            {/* Selector de variantes con stock */}
            <div className="modal-variants-section">
              <h3 className="modal-section-title">Selecciona tu talla:</h3>
              <div className="modal-variants-grid">
                {variantes.map((variante) => (
                  <button
                    key={variante.id}
                    className={`modal-variant-btn ${
                      selectedVariant?.id === variante.id ? 'selected' : ''
                    } ${variante.stock === 0 ? 'out-of-stock' : ''}`}
                    onClick={() => handleVariantSelect(variante)}
                    disabled={variante.stock === 0}
                  >
                    <span className="variant-talla">{variante.talla}</span>
                    <span className="variant-stock">
                      {variante.stock === 0 ? 'Sin stock' : `Stock: ${variante.stock}`}
                    </span>
                  </button>
                ))}
              </div>

              {selectedVariant && (
                <div className="selected-variant-info">
                  <p>
                    ✓ Talla seleccionada: <strong>{selectedVariant.talla}</strong>
                  </p>
                  <p>Stock disponible: <strong>{selectedVariant.stock} unidades</strong></p>
                </div>
              )}
            </div>

            {/* Botón añadir al carrito */}
            <button
              className={`modal-add-cart-btn ${!selectedVariant ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={stockTotal === 0}
            >
              {stockTotal === 0 ? 'Sin Stock' : 'Añadir al Carrito'}
            </button>

            {/* Notificación */}
            {notification && (
              <div className="modal-notification">
                {notification}
              </div>
            )}

            {/* Información adicional */}
            <div className="modal-extra-info">
              <div className="info-item">
                <span className="info-icon">🚚</span>
                <span>Envío gratuito en pedidos superiores a €50</span>
              </div>
              <div className="info-item">
                <span className="info-icon">↩️</span>
                <span>Devoluciones gratuitas en 30 días</span>
              </div>
              <div className="info-item">
                <span className="info-icon">✓</span>
                <span>Garantía de calidad</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
