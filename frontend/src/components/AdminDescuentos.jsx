import React, { useState, useEffect } from 'react';
import '../styles/AdminDescuentos.css';

const AdminDescuentos = ({ onClose }) => {
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [descuentoActual, setDescuentoActual] = useState({
    nombre: '',
    porcentaje: 0,
    cantidad: 0,
    tipo: 'general',
    tipoCodigo: 'general',
    tipoBeneficioGlobal: 'porcentaje',
    codigo: '',
    fechaInicio: '',
    fechaFin: '',
    activo: true,
    montoMinimo: 0,
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    cargarDescuentos();
  }, []);

  const cargarDescuentos = async () => {
    try {
      const response = await fetch('/api/descuentos');
      if (!response.ok) throw new Error('Error al cargar descuentos');
      const data = await response.json();
      setDescuentos(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setDescuentoActual({
      ...descuentoActual,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    try {
      const url = descuentoActual.id
        ? `/api/descuentos/${descuentoActual.id}`
        : '/api/descuentos';
      const method = descuentoActual.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(descuentoActual),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al guardar descuento');
      }

      setMensaje({
        texto: descuentoActual.id
          ? 'Descuento actualizado correctamente'
          : 'Descuento creado correctamente',
        tipo: 'success',
      });

      await cargarDescuentos();
      resetFormulario();
      setModoEdicion(false);
    } catch (err) {
      setMensaje({ texto: err.message, tipo: 'error' });
    }
  };

  const handleEditar = (descuento) => {
    setDescuentoActual({
      ...descuento,
      fechaInicio: descuento.fechaInicio ? descuento.fechaInicio.slice(0, 16) : '',
      fechaFin: descuento.fechaFin ? descuento.fechaFin.slice(0, 16) : '',
      tipoCodigo: descuento.tipoCodigo || 'general',
      tipoBeneficioGlobal: descuento.tipoBeneficioGlobal || 'porcentaje',
      cantidad: descuento.cantidad || 0,
    });
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este descuento?')) return;

    try {
      const response = await fetch(`/api/descuentos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al eliminar descuento');

      setMensaje({ texto: 'Descuento eliminado correctamente', tipo: 'success' });
      await cargarDescuentos();
    } catch (err) {
      setMensaje({ texto: err.message, tipo: 'error' });
    }
  };

  const resetFormulario = () => {
    setDescuentoActual({
      nombre: '',
      porcentaje: 0,
      cantidad: 0,
      tipo: 'general',
      tipoCodigo: 'general',
      tipoBeneficioGlobal: 'porcentaje',
      codigo: '',
      fechaInicio: '',
      fechaFin: '',
      activo: true,
      montoMinimo: 0,
    });
  };

  const handleCancelar = () => {
    resetFormulario();
    setModoEdicion(false);
    setMensaje({ texto: '', tipo: '' });
  };

  if (loading) {
    return (
      <div className="admin-descuentos-overlay">
        <div className="admin-descuentos-modal">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-descuentos-overlay" onClick={onClose}>
      <div className="admin-descuentos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>Administrar Descuentos</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {error && <div className="mensaje error">{error}</div>}

        <div className="admin-content">
          {/* Formulario */}
          <div className="formulario-seccion">
            <h3>{modoEdicion ? 'Editar Descuento' : 'Nuevo Descuento'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del descuento *</label>
                <input
                  type="text"
                  name="nombre"
                  value={descuentoActual.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group tipo-descuento-group">
                <label className="tipo-label">Tipo de Descuento *</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="tipoCodigo"
                      value="general"
                      checked={descuentoActual.tipoCodigo === 'general'}
                      onChange={handleInputChange}
                    />
                    <div className="radio-content">
                      <span className="radio-title">Descuento General</span>
                      <span className="radio-description">
                        Se aplica automáticamente a productos. Afecta a todos los productos cuando está activo.
                      </span>
                    </div>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="tipoCodigo"
                      value="promocional"
                      checked={descuentoActual.tipoCodigo === 'promocional'}
                      onChange={handleInputChange}
                    />
                    <div className="radio-content">
                      <span className="radio-title">Código Promocional</span>
                      <span className="radio-description">
                        Los clientes deben ingresar el código manualmente en el carrito para aplicar el descuento.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de beneficio *</label>
                  <select
                    name="tipoBeneficioGlobal"
                    value={descuentoActual.tipoBeneficioGlobal}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="cantidad">Cantidad fija (€)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                {descuentoActual.tipoBeneficioGlobal === 'porcentaje' ? (
                  <div className="form-group">
                    <label>Porcentaje de descuento *</label>
                    <input
                      type="number"
                      name="porcentaje"
                      value={descuentoActual.porcentaje}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Cantidad de descuento (€) *</label>
                    <input
                      type="number"
                      name="cantidad"
                      value={descuentoActual.cantidad}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Código {descuentoActual.tipoCodigo === 'promocional' && '*'}</label>
                  <input
                    type="text"
                    name="codigo"
                    value={descuentoActual.codigo}
                    onChange={handleInputChange}
                    required={descuentoActual.tipoCodigo === 'promocional'}
                    placeholder={descuentoActual.tipoCodigo === 'promocional' ? 'Ej: VERANO2025' : 'Opcional'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha inicio</label>
                  <input
                    type="datetime-local"
                    name="fechaInicio"
                    value={descuentoActual.fechaInicio}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha fin</label>
                  <input
                    type="datetime-local"
                    name="fechaFin"
                    value={descuentoActual.fechaFin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Monto mínimo de compra (€)</label>
                <input
                  type="number"
                  name="montoMinimo"
                  value={descuentoActual.montoMinimo}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={descuentoActual.activo}
                    onChange={handleInputChange}
                  />
                  Activo
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {modoEdicion ? 'Actualizar' : 'Crear'} Descuento
                </button>
                {modoEdicion && (
                  <button type="button" className="btn-secondary" onClick={handleCancelar}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de descuentos */}
          <div className="lista-seccion">
            <h3>Descuentos Existentes</h3>
            <div className="descuentos-lista">
              {descuentos.length === 0 ? (
                <p>No hay descuentos creados</p>
              ) : (
                descuentos.map((desc) => (
                  <div key={desc.id} className={`descuento-card ${!desc.activo ? 'inactivo' : ''}`}>
                    <div className="descuento-info">
                      <h4>{desc.nombre}</h4>
                      <div className="descuento-detalles">
                        <span className={`badge ${desc.tipoCodigo === 'promocional' ? 'promocional' : 'general'}`}>
                          {desc.tipoCodigo === 'promocional' ? 'Código Promocional' : 'Descuento General'}
                        </span>
                        {desc.codigo && <span className="codigo">Código: {desc.codigo}</span>}
                        {desc.tipoBeneficioGlobal === 'porcentaje' ? (
                          <span className="valor">{desc.porcentaje}% descuento</span>
                        ) : (
                          <span className="valor">{desc.cantidad}€ descuento</span>
                        )}
                        {desc.montoMinimo > 0 && (
                          <span className="monto-min">Mínimo: €{desc.montoMinimo}</span>
                        )}
                        <span className="usos">Usado {desc.vecesUsado || 0} veces</span>
                      </div>
                      {desc.fechaInicio && desc.fechaFin && (
                        <div className="fechas">
                          {new Date(desc.fechaInicio).toLocaleDateString()} - {new Date(desc.fechaFin).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="descuento-acciones">
                      <button className="btn-edit" onClick={() => handleEditar(desc)}>
                        Editar
                      </button>
                      <button className="btn-delete" onClick={() => handleEliminar(desc.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDescuentos;
