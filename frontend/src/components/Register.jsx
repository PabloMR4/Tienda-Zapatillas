import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = ({ onClose, onSwitchToLogin }) => {
  const { registro } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
  });
  const [error, setError] = useState('');
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
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await registro(userData);

    if (result.success) {
      onClose();
    } else {
      setError(result.mensaje);
    }

    setLoading(false);
  };

  return (
    <div className="auth-modal">
      <div className="auth-overlay" onClick={onClose} />
      <div className="auth-content">
        <button className="auth-close-btn" onClick={onClose}>
          ×
        </button>

        <h2>Crear Cuenta</h2>
        <p className="auth-subtitle">Regístrate para gestionar tus pedidos</p>

        <form onSubmit={handleSubmit} className="auth-form">
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

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono (opcional)</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-switch">
          ¿Ya tienes cuenta?{' '}
          <button onClick={onSwitchToLogin} className="auth-switch-btn">
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
