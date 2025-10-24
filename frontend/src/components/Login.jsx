import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = ({ onClose, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    const result = await login(formData.email, formData.password);

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

        <h2>Iniciar Sesión</h2>
        <p className="auth-subtitle">Accede a tu cuenta para continuar</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
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

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-switch">
          ¿No tienes cuenta?{' '}
          <button onClick={onSwitchToRegister} className="auth-switch-btn">
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
