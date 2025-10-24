import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = ({ onCheckout }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getSubtotal,
    getShippingCost,
    isFreeShipping,
    isCartOpen,
    setIsCartOpen,
    cuponAplicado,
    descuentoCupon,
    aplicarCupon,
    eliminarCupon,
  } = useCart();

  const [codigoCupon, setCodigoCupon] = useState('');
  const [mensajeCupon, setMensajeCupon] = useState('');
  const [cargandoCupon, setCargandoCupon] = useState(false);

  const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) {
      setMensajeCupon('Por favor, ingresa un código promocional');
      return;
    }

    setCargandoCupon(true);
    setMensajeCupon('');

    const resultado = await aplicarCupon(codigoCupon.trim());

    setCargandoCupon(false);

    if (resultado.success) {
      setMensajeCupon('✓ ' + resultado.message);
      setCodigoCupon('');
    } else {
      setMensajeCupon('✗ ' + resultado.message);
    }
  };

  const handleEliminarCupon = () => {
    eliminarCupon();
    setCodigoCupon('');
    setMensajeCupon('');
  };

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
              // Obtener imagen (variantes con imágenes o fallback a imagen del producto)
              const imagenItem = (item.imagenes && item.imagenes.length > 0)
                ? item.imagenes[0]
                : (item.imagen || 'https://via.placeholder.com/100x100?text=Sin+Imagen');

              return (
                <div key={`${item.id}-${item.varianteId || item.talla}`} className="cart-item">
                  <img src={imagenItem} alt={item.nombre} />
                  <div className="cart-item-details">
                    <h3>{item.nombre}</h3>
                    <p className="cart-item-size">Talla: {item.talla}</p>
                    {item.stockDisponible && (
                      <p className="cart-item-stock">Stock: {item.stockDisponible} unidades</p>
                    )}
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
                      <button onClick={() => updateQuantity(item.id, item.varianteId || 0, item.cantidad - 1)}>
                        −
                      </button>
                      <span>{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.varianteId || 0, item.cantidad + 1)}
                        disabled={item.stockDisponible && item.cantidad >= item.stockDisponible}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id, item.varianteId || 0)}
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
            {/* Campo de Código Promocional */}
            <div className="cupon-section">
              {!cuponAplicado ? (
                <>
                  <div className="cupon-input-group">
                    <input
                      type="text"
                      className="cupon-input"
                      placeholder="Insertar código promocional"
                      value={codigoCupon}
                      onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleAplicarCupon()}
                      disabled={cargandoCupon}
                    />
                    <button
                      className="cupon-btn"
                      onClick={handleAplicarCupon}
                      disabled={cargandoCupon}
                    >
                      {cargandoCupon ? 'Validando...' : 'Aplicar'}
                    </button>
                  </div>
                  {mensajeCupon && (
                    <div className={`cupon-mensaje ${mensajeCupon.startsWith('✓') ? 'success' : 'error'}`}>
                      {mensajeCupon}
                    </div>
                  )}
                </>
              ) : (
                <div className="cupon-aplicado">
                  <div className="cupon-info">
                    <span className="cupon-icon">🎟️</span>
                    <div>
                      <div className="cupon-nombre">{cuponAplicado.nombre}</div>
                      <div className="cupon-codigo">Código: {cuponAplicado.codigo}</div>
                    </div>
                  </div>
                  <button className="cupon-eliminar" onClick={handleEliminarCupon}>
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="cart-summary">
              <div className="cart-subtotal">
                <span>Subtotal:</span>
                <span>€{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="cart-shipping">
                <span>Envío:</span>
                <span className={isFreeShipping() ? 'free-shipping' : ''}>
                  {isFreeShipping() ? 'GRATIS' : `€${getShippingCost().toFixed(2)}`}
                </span>
              </div>
              {!isFreeShipping() && getSubtotal() > 0 && (
                <div className="shipping-notice">
                  Envío gratis en compras superiores a €50
                </div>
              )}
              {descuentoCupon > 0 && (
                <div className="cart-discount">
                  <span>Descuento cupón:</span>
                  <span className="discount-amount">-€{descuentoCupon.toFixed(2)}</span>
                </div>
              )}
              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">€{getCartTotal().toFixed(2)}</span>
              </div>
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
