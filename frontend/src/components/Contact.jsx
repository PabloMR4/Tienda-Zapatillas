import React, { useState } from 'react';
import '../styles/Contact.css';

const Contact = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('¡Mensaje enviado correctamente! Te responderemos pronto a tu correo.');

        // Limpiar formulario después de 3 segundos
        setTimeout(() => {
          setFormData({
            nombre: '',
            email: '',
            asunto: '',
            mensaje: '',
          });
          setStatus('');
          onClose();
        }, 3000);
      } else {
        setStatus(data.mensaje || 'Error al enviar el mensaje. Inténtalo de nuevo.');
      }
    } catch (error) {
      setStatus('Error de conexión. Por favor, inténtalo más tarde.');
    }

    setLoading(false);
  };

  return (
    <div className="contact-modal">
      <div className="contact-overlay" onClick={onClose} />
      <div className="contact-content">
        <button className="contact-close-btn" onClick={onClose}>
          ×
        </button>

        <h2>Contáctanos</h2>
        <p className="contact-subtitle">Estamos aquí para ayudarte</p>

        <div className="contact-info">
          <div className="contact-info-item">
            <span className="contact-icon">📧</span>
            <div>
              <strong>Email</strong>
              <p>info@shoelandia.es</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="asunto">Asunto</label>
            <input
              type="text"
              id="asunto"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              required
              placeholder="¿En qué podemos ayudarte?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          {status && <div className="success-message">{status}</div>}

          <button
            type="submit"
            className="contact-submit-btn"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
