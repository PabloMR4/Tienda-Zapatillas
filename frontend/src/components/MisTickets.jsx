import React, { useState, useEffect } from 'react';
import '../styles/MisTickets.css';

const MisTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [sendingReply, setSendingReply] = useState(false);
  const [pedidos, setPedidos] = useState([]);

  // Nuevo ticket form
  const [newTicket, setNewTicket] = useState({
    asunto: '',
    mensaje: '',
    prioridad: 'Media',
    pedidoId: '',
  });
  const [newTicketFiles, setNewTicketFiles] = useState([]);
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    console.log('MisTickets montado - iniciando carga');
    loadTickets();
    loadPedidos();
  }, []);

  console.log('MisTickets render - loading:', loading, 'tickets:', tickets.length);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Tickets cargados:', data);
        setTickets(data);
      } else {
        console.error('Error en respuesta:', response.status);
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
    }
    setLoading(false);
  };

  const loadPedidos = async () => {
    try {
      const response = await fetch('/api/clientes/pedidos', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo pedidos activos (no entregados ni cancelados)
        const pedidosActivos = data.filter(p =>
          p.estado !== 'Entregado' && p.estado !== 'Cancelado'
        );
        setPedidos(pedidosActivos);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  const loadTicketDetails = async (ticketId) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data);
      }
    } catch (error) {
      console.error('Error cargando detalles del ticket:', error);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setCreatingTicket(true);

    try {
      const formData = new FormData();
      formData.append('asunto', newTicket.asunto);
      formData.append('mensaje', newTicket.mensaje);
      formData.append('prioridad', newTicket.prioridad);
      if (newTicket.pedidoId) {
        formData.append('pedidoId', newTicket.pedidoId);
      }

      newTicketFiles.forEach((file) => {
        formData.append('archivos', file);
      });

      const response = await fetch('/api/tickets', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setShowNewTicketForm(false);
        setNewTicket({ asunto: '', mensaje: '', prioridad: 'Media', pedidoId: '' });
        setNewTicketFiles([]);
        loadTickets();
        // Abrir el ticket recién creado
        loadTicketDetails(data.id);
      } else {
        const error = await response.json();
        alert(error.mensaje || 'Error al crear el ticket');
      }
    } catch (error) {
      alert('Error de conexión al crear el ticket');
    }

    setCreatingTicket(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingReply(true);

    try {
      const formData = new FormData();
      formData.append('mensaje', replyMessage);

      replyFiles.forEach((file) => {
        formData.append('archivos', file);
      });

      const response = await fetch(`/api/tickets/${selectedTicket.id}/mensajes`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setReplyMessage('');
        setReplyFiles([]);
        loadTicketDetails(selectedTicket.id);
      } else {
        const error = await response.json();
        alert(error.mensaje || 'Error al enviar el mensaje');
      }
    } catch (error) {
      alert('Error de conexión al enviar el mensaje');
    }

    setSendingReply(false);
  };

  const handleFileChange = (e, isNewTicket = false) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      alert('Máximo 5 archivos permitidos');
      return;
    }

    const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Algunos archivos superan el límite de 5MB');
      return;
    }

    if (isNewTicket) {
      setNewTicketFiles(files);
    } else {
      setReplyFiles(files);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Nuevo':
        return 'estado-nuevo';
      case 'En Proceso':
        return 'estado-proceso';
      case 'Resuelto':
        return 'estado-resuelto';
      case 'Cerrado':
        return 'estado-cerrado';
      default:
        return '';
    }
  };

  const getPriorityClass = (prioridad) => {
    switch (prioridad) {
      case 'Baja':
        return 'prioridad-baja';
      case 'Media':
        return 'prioridad-media';
      case 'Alta':
        return 'prioridad-alta';
      case 'Urgente':
        return 'prioridad-urgente';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '200px' }}>
        <h3 style={{ color: '#333' }}>Cargando tickets...</h3>
        <p>Por favor espera...</p>
      </div>
    );
  }

  // Vista de detalles del ticket
  if (selectedTicket) {
    return (
      <div className="ticket-details-view">
        <button
          className="btn-back"
          onClick={() => setSelectedTicket(null)}
        >
          ← Volver a mis tickets
        </button>

        <div className="ticket-details-header">
          <div>
            <h3>Ticket #{selectedTicket.id}</h3>
            <p className="ticket-subject">{selectedTicket.asunto}</p>
          </div>
          <div className="ticket-meta">
            <span className={`ticket-estado ${getEstadoClass(selectedTicket.estado)}`}>
              {selectedTicket.estado}
            </span>
            <span className={`ticket-prioridad ${getPriorityClass(selectedTicket.prioridad)}`}>
              {selectedTicket.prioridad}
            </span>
          </div>
        </div>

        <div className="ticket-info">
          <span>Creado: {formatDate(selectedTicket.fechaCreacion)}</span>
          {selectedTicket.fechaActualizacion && (
            <span>Actualizado: {formatDate(selectedTicket.fechaActualizacion)}</span>
          )}
        </div>

        {selectedTicket.pedido && (
          <div className="ticket-pedido-info">
            <h4>📦 Relacionado con el Pedido #{selectedTicket.pedido.id}</h4>
            <div className="pedido-details">
              <span>Estado: <strong>{selectedTicket.pedido.estado}</strong></span>
              <span>Total: <strong>€{selectedTicket.pedido.total.toFixed(2)}</strong></span>
              <span>Fecha: <strong>{new Date(selectedTicket.pedido.fecha).toLocaleDateString('es-ES')}</strong></span>
            </div>
          </div>
        )}

        <div className="ticket-conversation">
          {selectedTicket.mensajes.map((mensaje, index) => (
            <div
              key={index}
              className={`mensaje ${mensaje.tipo === 'cliente' ? 'mensaje-cliente' : 'mensaje-admin'}`}
            >
              <div className="mensaje-header">
                <strong>{mensaje.autor}</strong>
                <span className="mensaje-fecha">{formatDate(mensaje.fecha)}</span>
              </div>
              <div className="mensaje-body">{mensaje.mensaje}</div>
              {mensaje.archivos && mensaje.archivos.length > 0 && (
                <div className="mensaje-attachments">
                  <div className="attachments-label">Archivos adjuntos:</div>
                  {mensaje.archivos.map((archivo, idx) => (
                    <a
                      key={idx}
                      href={archivo.ruta}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="attachment-link"
                    >
                      📄 {archivo.nombre} ({(archivo.tamaño / 1024).toFixed(2)} KB)
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedTicket.estado !== 'Cerrado' && (
          <form onSubmit={handleReply} className="reply-form">
            <h4>Responder</h4>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows="4"
              required
            />

            <div className="form-group">
              <label htmlFor="reply-files">Archivos Adjuntos (opcional)</label>
              <input
                type="file"
                id="reply-files"
                onChange={(e) => handleFileChange(e, false)}
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
              />
              <small>Máximo 5 archivos de 5MB cada uno</small>
              {replyFiles.length > 0 && (
                <ul className="files-list">
                  {replyFiles.map((file, idx) => (
                    <li key={idx}>
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" disabled={sendingReply} className="btn-send-reply">
              {sendingReply ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Vista de lista de tickets
  if (showNewTicketForm) {
    return (
      <div className="new-ticket-form-view">
        <button
          className="btn-back"
          onClick={() => {
            setShowNewTicketForm(false);
            setNewTicket({ asunto: '', mensaje: '', prioridad: 'Media', pedidoId: '' });
            setNewTicketFiles([]);
          }}
        >
          ← Cancelar
        </button>

        <h3>Crear Nuevo Ticket de Soporte</h3>

        <form onSubmit={handleCreateTicket} className="ticket-form">
          <div className="form-group">
            <label htmlFor="asunto">Asunto</label>
            <input
              type="text"
              id="asunto"
              value={newTicket.asunto}
              onChange={(e) => setNewTicket({ ...newTicket, asunto: e.target.value })}
              placeholder="¿En qué podemos ayudarte?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prioridad">Prioridad</label>
            <select
              id="prioridad"
              value={newTicket.prioridad}
              onChange={(e) => setNewTicket({ ...newTicket, prioridad: e.target.value })}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pedidoId">Relacionado con un pedido (opcional)</label>
            <select
              id="pedidoId"
              value={newTicket.pedidoId}
              onChange={(e) => setNewTicket({ ...newTicket, pedidoId: e.target.value })}
            >
              <option value="">Ningún pedido específico</option>
              {pedidos.map((pedido) => (
                <option key={pedido.id} value={pedido.id}>
                  Pedido #{pedido.id} - {pedido.estado} - €{pedido.total.toFixed(2)} - {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                </option>
              ))}
            </select>
            {pedidos.length === 0 && (
              <small className="help-text">No tienes pedidos activos en este momento</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              value={newTicket.mensaje}
              onChange={(e) => setNewTicket({ ...newTicket, mensaje: e.target.value })}
              placeholder="Describe tu problema o consulta..."
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-ticket-files">Archivos Adjuntos (opcional)</label>
            <input
              type="file"
              id="new-ticket-files"
              onChange={(e) => handleFileChange(e, true)}
              multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
            />
            <small>Máximo 5 archivos de 5MB cada uno. Formatos: imágenes, PDF, documentos, ZIP</small>
            {newTicketFiles.length > 0 && (
              <ul className="files-list">
                {newTicketFiles.map((file, idx) => (
                  <li key={idx}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" disabled={creatingTicket} className="btn-create-ticket">
            {creatingTicket ? 'Creando...' : 'Crear Ticket'}
          </button>
        </form>
      </div>
    );
  }

  // Vista principal de tickets
  return (
    <div className="mis-tickets-view" style={{ background: 'white', minHeight: '400px' }}>
      <div className="tickets-header">
        <h3 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '20px' }}>Mis Tickets de Soporte</h3>
        <button
          className="btn-new-ticket"
          onClick={() => setShowNewTicketForm(true)}
          style={{ padding: '12px 24px', cursor: 'pointer' }}
        >
          + Nuevo Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '12px', marginTop: '20px' }}>
          <p style={{ fontSize: '1.2rem', color: '#6c757d', marginBottom: '10px' }}>No tienes tickets de soporte</p>
          <p className="empty-state-hint" style={{ color: '#95a5a6', marginBottom: '20px' }}>
            Si necesitas ayuda, crea un ticket y nuestro equipo te responderá pronto
          </p>
          <button
            className="btn-create-first"
            onClick={() => setShowNewTicketForm(true)}
            style={{ padding: '14px 28px', cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}
          >
            Crear Mi Primer Ticket
          </button>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => loadTicketDetails(ticket.id)}
            >
              <div className="ticket-card-header">
                <div>
                  <span className="ticket-id">#{ticket.id}</span>
                  <h4>{ticket.asunto}</h4>
                </div>
                <span className={`ticket-estado ${getEstadoClass(ticket.estado)}`}>
                  {ticket.estado}
                </span>
              </div>
              <div className="ticket-card-body">
                <span className={`ticket-prioridad ${getPriorityClass(ticket.prioridad)}`}>
                  {ticket.prioridad}
                </span>
                <span className="ticket-date">
                  {formatDate(ticket.fechaCreacion)}
                </span>
                <span className="ticket-messages">
                  {ticket.mensajes.length} mensaje{ticket.mensajes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisTickets;
