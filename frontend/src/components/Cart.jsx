import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = ({ onCheckout }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Tu Carrito</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>
            ×
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Tu carrito está vacío</p>
              <button onClick={() => setIsCartOpen(false)}>
                Seguir Comprando
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const precioFinal = item.descuento ? item.descuento.precioConDescuento : item.precio;
              return (
                <div key={`${item.id}-${item.talla}`} className="cart-item">
                  <img src={item.imagen} alt={item.nombre} />
                  <div className="cart-item-details">
                    <h3>{item.nombre}</h3>
                    <p className="cart-item-size">Talla: {item.talla}</p>
                    {item.descuento ? (
                      <div className="cart-item-price-container">
                        <p className="cart-item-price discount">€{precioFinal.toFixed(2)}</p>
                        <p className="cart-item-price-original">€{item.precio.toFixed(2)}</p>
                        <p className="cart-item-discount-badge">-{item.descuento.porcentaje}%</p>
                      </div>
                    ) : (
                      <p className="cart-item-price">€{item.precio.toFixed(2)}</p>
                    )}

                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.talla, item.cantidad - 1)}>
                        −
                      </button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.id, item.talla, item.cantidad + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id, item.talla)}
                  >
                    🗑
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span className="total-amount">€{getCartTotal().toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>
              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
