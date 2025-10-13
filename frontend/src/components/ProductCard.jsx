import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ProductCard.css';

const ProductCard = ({ producto }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!selectedSize) {
      setShowSizeSelector(true);
      return;
    }
    addToCart(producto, selectedSize);
    setShowSizeSelector(false);
    setSelectedSize('');
  };

  const handleSizeSelect = (size, e) => {
    e.stopPropagation();
    setSelectedSize(size);
    addToCart(producto, size);
    setShowSizeSelector(false);
  };

  return (
    <div className="product-card">
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

      <div className="product-image-container">
        <img src={producto.imagen} alt={producto.nombre} className="product-image" />
        <div className="product-overlay">
          <button className="quick-add-btn" onClick={handleAddToCart}>
            {showSizeSelector ? 'Selecciona talla' : 'Añadir al carrito'}
          </button>
        </div>
      </div>

      {showSizeSelector && (
        <div className="size-selector">
          {producto.tallas.map(talla => (
            <button
              key={talla}
              className="size-option"
              onClick={(e) => handleSizeSelect(talla, e)}
            >
              {talla}
            </button>
          ))}
        </div>
      )}

      <div className="product-info">
        <h3 className="product-name">{producto.nombre}</h3>
        <p className="product-description">{producto.descripcion}</p>
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
