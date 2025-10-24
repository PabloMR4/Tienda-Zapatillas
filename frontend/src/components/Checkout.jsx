import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { crearPedido } from '../services/api';
import StripeCheckout from './StripeCheckout';
import '../styles/Checkout.css';

const Checkout = ({ onClose }) => {
  const { cartItems, getCartTotal, getSubtotal, getShippingCost, isFreeShipping, clearCart, cuponAplicado, descuentoCupon } = useCart();
  const { isAuthenticated, user, getPerfil } = useAuth();
  const [step, setStep] = useState(1); // 1: Datos, 2: Pago, 3: Confirmación
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [descuentoPedido, setDescuentoPedido] = useState(null);
  const [descuentos, setDescuentos] = useState([]);
  const [pedidoId, setPedidoId] = useState(null);

  // Cargar datos del usuario si está autenticado
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated) {
        const perfil = await getPerfil();
        if (perfil) {
          setFormData({
            nombre: perfil.nombre || '',
            email: perfil.email || '',
            telefono: perfil.telefono || '',
            direccion: perfil.direccion || '',
            ciudad: perfil.ciudad || '',
            provincia: perfil.provincia || '',
            codigoPostal: perfil.codigoPostal || '',
          });
        }
      }
    };
    loadUserData();
  }, [isAuthenticated, getPerfil]);

  // Cargar descuentos al montar el componente
  useEffect(() => {
    const fetchDescuentos = async () => {
      try {
        const response = await fetch('/api/descuentos');
        const data = await response.json();
        setDescuentos(data);
      } catch (error) {
        console.error('Error al cargar descuentos:', error);
      }
    };
    fetchDescuentos();
  }, []);

  // Calcular descuento aplicable basado en el monto del pedido
  useEffect(() => {
    const calcularDescuentoPedido = () => {
      const subtotal = getSubtotal();
      const ahora = new Date();

      const descuentosAplicables = descuentos.filter(descuento => {
        if (!descuento.activo || descuento.tipo !== 'pedido') return false;
        if (descuento.fechaInicio && new Date(descuento.fechaInicio) > ahora) return false;
        if (descuento.fechaFin && new Date(descuento.fechaFin) < ahora) return false;
        if (!descuento.montoMinimo || subtotal < descuento.montoMinimo) return false;
        return true;
      });

      if (descuentosAplicables.length === 0) {
        setDescuentoPedido(null);
        return;
      }

      const mejorDescuento = descuentosAplicables.reduce((max, desc) => {
        if (desc.montoMinimo > (max.montoMinimo || 0)) return desc;
        if (desc.montoMinimo < (max.montoMinimo || 0)) return max;
        return (desc.porcentaje || 0) > (max.porcentaje || 0) ? desc : max;
      });

      setDescuentoPedido(mejorDescuento);
    };

    if (descuentos.length > 0) {
      calcularDescuentoPedido();
    }
  }, [descuentos, cartItems, getSubtotal]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calcularTotalFinal = () => {
    const subtotal = getSubtotal();
    let total = subtotal;

    // Aplicar descuento de cupón del carrito (si existe)
    if (descuentoCupon > 0) {
      total = total - descuentoCupon;
    }

    // Aplicar descuento de pedido si existe
    if (descuentoPedido && descuentoPedido.tipoBeneficio === 'descuento') {
      const descuento = total * (descuentoPedido.porcentaje / 100);
      total = total - descuento;
    }

    // Calcular costo de envío
    // Envío gratis si: 1) Ya cumple el mínimo (€50+) o 2) Hay descuento de envío gratis del pedido
    const envioGratis = isFreeShipping() || (descuentoPedido && descuentoPedido.tipoBeneficio === 'envio_gratis');
    const costoEnvio = envioGratis ? 0 : getShippingCost();

    total += costoEnvio;

    return Math.max(0, total); // No permitir totales negativos
  };

  const handleContinueToPago = (e) => {
    e.preventDefault();
    setError('');

    // Validar datos
    if (!formData.nombre || !formData.email || !formData.direccion || !formData.ciudad) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setStep(2);
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setLoading(true);
    setError('');

    try {
      const pedidoData = {
        items: cartItems.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
          talla: item.talla,
          descuento: item.descuento || null,
        })),
        total: calcularTotalFinal(),
        cliente: formData,
        paymentIntentId: paymentIntentId,
        cuponAplicado: cuponAplicado ? {
          id: cuponAplicado.id,
          codigo: cuponAplicado.codigo,
          nombre: cuponAplicado.nombre,
          descuento: descuentoCupon
        } : null,
        descuentoPedido: descuentoPedido ? {
          id: descuentoPedido.id,
          nombre: descuentoPedido.nombre,
          tipoBeneficio: descuentoPedido.tipoBeneficio,
          porcentaje: descuentoPedido.porcentaje || 0,
          montoMinimo: descuentoPedido.montoMinimo
        } : null,
      };

      const pedido = await crearPedido(pedidoData);
      setPedidoId(pedido.id);
      setSuccess(true);
      clearCart();

      setTimeout(() => {
        onClose();
      }, 5000);
    } catch (err) {
      setError('Error al procesar el pedido. Por favor, contacta con soporte.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (errorMsg) => {
    setError(errorMsg);
  };

  if (success) {
    return (
      <div className="checkout-modal">
        <div className="checkout-overlay" onClick={onClose} />
        <div className="checkout-content success-message">
          <div className="success-icon">✓</div>
          <h2>¡Pedido Realizado!</h2>
          <p>Tu pedido ha sido procesado correctamente.</p>
          <p className="order-number">Número de pedido: #{pedidoId}</p>
          <p className="order-email">
            Recibirás un email de confirmación en: {formData.email}
          </p>
          <button onClick={onClose} className="close-success-btn">
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-modal">
      <div className="checkout-overlay" onClick={onClose} />
      <div className="checkout-content">
        <button className="checkout-close-btn" onClick={onClose}>
          ×
        </button>

        <h2>Finalizar Compra</h2>

        {/* Indicador de pasos */}
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Datos</div>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Pago</div>
          </div>
        </div>

        {/* Resumen siempre visible */}
        <div className="checkout-summary">
          <h3>Resumen del Pedido</h3>
          <div className="summary-items">
            {cartItems.map((item) => {
              const precioFinal = item.descuento ? item.descuento.precioConDescuento : item.precio;
              return (
                <div key={`${item.id}-${item.talla}`} className="summary-item">
                  <span>
                    {item.nombre} (Talla: {item.talla}) x {item.cantidad}
                  </span>
                  <span>€{(precioFinal * item.cantidad).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="summary-subtotal">
            <span>Subtotal:</span>
            <span>€{getSubtotal().toFixed(2)}</span>
          </div>
          {descuentoCupon > 0 && cuponAplicado && (
            <div className="summary-discount">
              <span>✓ Cupón: {cuponAplicado.codigo}</span>
              <span style={{ color: '#4caf50' }}>
                -€{descuentoCupon.toFixed(2)}
              </span>
            </div>
          )}
          {descuentoPedido && descuentoPedido.tipoBeneficio === 'descuento' && (
            <div className="summary-discount">
              <span>✓ {descuentoPedido.nombre} (-{descuentoPedido.porcentaje}%)</span>
              <span style={{ color: '#4caf50' }}>
                -€{((getSubtotal() - descuentoCupon) * (descuentoPedido.porcentaje / 100)).toFixed(2)}
              </span>
            </div>
          )}
          <div className="summary-shipping">
            <span>Envío:</span>
            <span style={{ color: (isFreeShipping() || (descuentoPedido && descuentoPedido.tipoBeneficio === 'envio_gratis')) ? '#4caf50' : 'inherit' }}>
              {(isFreeShipping() || (descuentoPedido && descuentoPedido.tipoBeneficio === 'envio_gratis'))
                ? 'GRATIS'
                : `€${getShippingCost().toFixed(2)}`}
            </span>
          </div>
          {descuentoPedido && descuentoPedido.tipoBeneficio === 'envio_gratis' && (
            <div className="summary-discount">
              <span>✓ {descuentoPedido.nombre}</span>
              <span style={{ color: '#4caf50' }}>Envío Gratis</span>
            </div>
          )}
          {!isFreeShipping() && !descuentoPedido && getSubtotal() > 0 && (
            <div className="shipping-promo-notice">
              Envío gratis en compras superiores a €50
            </div>
          )}
          <div className="summary-total">
            <span>Total:</span>
            <span className="total-price">€{calcularTotalFinal().toFixed(2)}</span>
          </div>
        </div>

        {/* Paso 1: Datos de envío */}
        {step === 1 && (
          <form onSubmit={handleContinueToPago} className="checkout-form">
            <h3>Información de Envío</h3>

            {isAuthenticated && (
              <div className="info-notice">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                Hemos cargado tus datos guardados. Puedes modificarlos si es necesario.
              </div>
            )}

            {!isAuthenticated && (
              <div className="guest-notice">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <div className="guest-notice-content">
                  <p className="guest-notice-title">¿Sabías que puedes crear una cuenta?</p>
                  <p className="guest-notice-text">
                    Regístrate para guardar tu información, hacer pedidos más rápido y ver tu historial de compras.
                  </p>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ciudad">Ciudad *</label>
                <input
                  type="text"
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="provincia">Provincia *</label>
                <input
                  type="text"
                  id="provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="codigoPostal">Código Postal *</label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="submit-order-btn"
            >
              Continuar al Pago
            </button>
          </form>
        )}

        {/* Paso 2: Pago con Stripe */}
        {step === 2 && (
          <div className="payment-section">
            <h3>Método de Pago</h3>

            <button
              onClick={() => setStep(1)}
              className="btn-back"
            >
              ← Volver a datos de envío
            </button>

            <StripeCheckout
              amount={calcularTotalFinal()}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            {error && <div className="error-message" style={{ marginTop: '20px' }}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
