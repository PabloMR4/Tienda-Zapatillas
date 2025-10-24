import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MisTickets from './MisTickets';
import '../styles/UserProfile.css';

const UserProfile = ({ onClose }) => {
  const { user, getPerfil, updatePerfil, getPedidos, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    passwordActual: '',
    passwordNueva: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [perfilData, pedidosData] = await Promise.all([
      getPerfil(),
      getPedidos()
    ]);

    if (perfilData) {
      setPerfil(perfilData);
      setFormData({
        nombre: perfilData.nombre || '',
        telefono: perfilData.telefono || '',
        direccion: perfilData.direccion || '',
        ciudad: perfilData.ciudad || '',
        provincia: perfilData.provincia || '',
        codigoPostal: perfilData.codigoPostal || '',
        passwordActual: '',
        passwordNueva: '',
      });
    }

    setPedidos(pedidosData);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const result = await updatePerfil(formData);

    if (result.success) {
      setMessage({ type: 'success', text: result.mensaje });
      setEditMode(false);
      loadData();
      // Limpiar contraseñas
      setFormData(prev => ({
        ...prev,
        passwordActual: '',
        passwordNueva: '',
      }));
    } else {
      setMessage({ type: 'error', text: result.mensaje });
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Nuevo Pedido':
        return 'estado-nuevo';
      case 'En Proceso':
        return 'estado-proceso';
      case 'Enviado':
        return 'estado-enviado';
      case 'Entregado':
        return 'estado-entregado';
      case 'Cancelado':
        return 'estado-cancelado';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="profile-modal">
        <div className="profile-overlay" onClick={onClose} />
        <div className="profile-content">
          <div className="loading-spinner">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-modal">
      <div className="profile-overlay" onClick={onClose} />
      <div className="profile-content">
        <button className="profile-close-btn" onClick={onClose}>
          ×
        </button>

        <div className="profile-header">
          <h2>Mi Cuenta</h2>
          <p className="profile-user-name">Hola, {user?.nombre}</p>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pedidos')}
          >
            Mis Pedidos
          </button>
          <button
            className={`tab-btn ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            Mi Perfil
          </button>
          <button
            className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            Mis Tickets
          </button>
        </div>

        {activeTab === 'pedidos' && (
          <div className="tab-content">
            <h3>Historial de Pedidos</h3>
            {pedidos.length === 0 ? (
              <div className="empty-state">
                <p>No tienes pedidos aún</p>
                <button onClick={onClose} className="btn-continue">
                  Explorar Productos
                </button>
              </div>
            ) : (
              <div className="pedidos-list">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="pedido-card">
                    <div className="pedido-header">
                      <div>
                        <span className="pedido-id">Pedido #{pedido.id}</span>
                        <span className="pedido-fecha">
                          {formatDate(pedido.fecha)}
                        </span>
                      </div>
                      <span className={`pedido-estado ${getEstadoClass(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                    </div>
                    <div className="pedido-items">
                      {pedido.items.map((item, index) => (
                        <div key={index} className="pedido-item">
                          <span>
                            {item.nombre} (Talla: {item.talla}) x {item.cantidad}
                          </span>
                          <span>€{(item.precio * item.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pedido-total">
                      <span>Total:</span>
                      <span className="total-amount">€{pedido.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="tab-content">
            <div className="perfil-header">
              <h3>Información Personal</h3>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="btn-edit">
                  Editar
                </button>
              )}
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {editMode ? (
              <form onSubmit={handleSubmit} className="perfil-form">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre Completo</label>
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
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    value={perfil?.email}
                    disabled
                    className="input-disabled"
                  />
                  <small>El email no se puede modificar</small>
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ciudad">Ciudad</label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="provincia">Provincia</label>
                    <input
                      type="text"
                      id="provincia"
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="codigoPostal">Código Postal</label>
                  <input
                    type="text"
                    id="codigoPostal"
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-divider">
                  <h4>Cambiar Contraseña (opcional)</h4>
                </div>

                <div className="form-group">
                  <label htmlFor="passwordActual">Contraseña Actual</label>
                  <input
                    type="password"
                    id="passwordActual"
                    name="passwordActual"
                    value={formData.passwordActual}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="passwordNueva">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="passwordNueva"
                    name="passwordNueva"
                    value={formData.passwordNueva}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setMessage({ type: '', text: '' });
                    }}
                    className="btn-cancel"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="perfil-info">
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">{perfil?.nombre}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{perfil?.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Teléfono:</span>
                  <span className="info-value">{perfil?.telefono || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Dirección:</span>
                  <span className="info-value">{perfil?.direccion || 'No especificada'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ciudad:</span>
                  <span className="info-value">{perfil?.ciudad || 'No especificada'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Provincia:</span>
                  <span className="info-value">{perfil?.provincia || 'No especificada'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Código Postal:</span>
                  <span className="info-value">{perfil?.codigoPostal || 'No especificado'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="tab-content">
            <MisTickets />
          </div>
        )}

        <div className="profile-footer">
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
