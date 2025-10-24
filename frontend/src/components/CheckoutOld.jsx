import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { crearPedido } from '../services/api';
import '../styles/Checkout.css';

const Checkout = ({ onClose }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
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

  // Cargar descuentos al montar el componente
  useEffect(() => {
    const fetchDescuentos = async () => {
      try {
        const response = await fetch('http://109.205.182.103/api/descuentos');
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
      const subtotal = getCartTotal();
      const ahora = new Date();

      // Filtrar descuentos activos de tipo "pedido" dentro del rango de fechas
      const descuentosAplicables = descuentos.filter(descuento => {
        if (!descuento.activo || descuento.tipo !== 'pedido') return false;
        if (descuento.fechaInicio && new Date(descuento.fechaInicio) > ahora) return false;
        if (descuento.fechaFin && new Date(descuento.fechaFin) < ahora) return false;
        if (!descuento.montoMinimo || subtotal < descuento.montoMinimo) return false;
        return true;
      });

      // Obtener el mejor descuento (mayor monto mínimo o mayor porcentaje)
      if (descuentosAplicables.length === 0) {
        setDescuentoPedido(null);
        return;
      }

      const mejorDescuento = descuentosAplicables.reduce((max, desc) => {
        // Priorizar por monto mínimo más alto primero
        if (desc.montoMinimo > (max.montoMinimo || 0)) return desc;
        if (desc.montoMinimo < (max.montoMinimo || 0)) return max;
        // Si tienen el mismo monto mínimo, elegir el de mayor porcentaje
        return (desc.porcentaje || 0) > (max.porcentaje || 0) ? desc : max;
      });

      setDescuentoPedido(mejorDescuento);
    };

    if (descuentos.length > 0) {
      calcularDescuentoPedido();
    }
  }, [descuentos, cartItems, getCartTotal]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calcularTotalFinal = () => {
    const subtotal = getCartTotal();

    if (!descuentoPedido) return subtotal;

    if (descuentoPedido.tipoBeneficio === 'envio_gratis') {
      // Si es envío gratis, el total es el mismo (por ahora no calculamos el envío)
      return subtotal;
    } else if (descuentoPedido.tipoBeneficio === 'descuento') {
      // Aplicar descuento porcentual al subtotal
      const descuento = subtotal * (descuentoPedido.porcentaje / 100);
      return subtotal - descuento;
    }

    return subtotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        descuentoPedido: descuentoPedido ? {
          id: descuentoPedido.id,
          nombre: descuentoPedido.nombre,
          tipoBeneficio: descuentoPedido.tipoBeneficio,
          porcentaje: descuentoPedido.porcentaje || 0,
          montoMinimo: descuentoPedido.montoMinimo
        } : null,
      };

      await crearPedido(pedidoData);
      setSuccess(true);
      clearCart();

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-modal">
        <div className="checkout-overlay" onClick={onClose} />
        <div className="checkout-content success-message">
          <div className="success-icon">✓</div>
          <h2>¡Pedido Realizado!</h2>
          <p>Tu pedido ha sido procesado correctamente.</p>
          <p className="order-number">Número de pedido: #{Math.floor(Math.random() * 10000)}</p>
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

        <div className="checkout-summary">
          <h3>Resumen del Pedido</h3>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.talla}`} className="summary-item">
                <span>
                  {item.nombre} (Talla: {item.talla}) x {item.cantidad}
                </span>
                <span>€{(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-subtotal">
            <span>Subtotal:</span>
            <span>€{getCartTotal().toFixed(2)}</span>
          </div>
          {descuentoPedido && (
            <div className="summary-discount">
              <span>
                {descuentoPedido.tipoBeneficio === 'envio_gratis'
                  ? `✓ ${descuentoPedido.nombre} - Envío Gratis`
                  : `✓ ${descuentoPedido.nombre} (-${descuentoPedido.porcentaje}%)`}
              </span>
              <span style={{ color: '#4caf50' }}>
                {descuentoPedido.tipoBeneficio === 'descuento'
                  ? `-€${(getCartTotal() * (descuentoPedido.porcentaje / 100)).toFixed(2)}`
                  : 'Gratis'}
              </span>
            </div>
          )}
          <div className="summary-total">
            <span>Total:</span>
            <span className="total-price">€{calcularTotalFinal().toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <h3>Información de Envío</h3>

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
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
