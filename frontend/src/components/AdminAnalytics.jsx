import React, { useState, useEffect } from 'react';
import '../styles/AdminAnalytics.css';

const AdminAnalytics = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Aquí Google Analytics se cargará automáticamente si está instalado en index.html
    // Podemos verificar si está disponible
    if (window.gtag) {
      // Registrar vista de página
      window.gtag('event', 'page_view', {
        page_title: 'Admin Analytics',
        page_location: window.location.href,
        page_path: '/admin/analytics'
      });
    }
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="admin-analytics-overlay" onClick={onClose}>
      <div className="admin-analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>Analíticas Web</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="analytics-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabClick('overview')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            Vista General
          </button>
          <button
            className={`tab-btn ${activeTab === 'realtime' ? 'active' : ''}`}
            onClick={() => handleTabClick('realtime')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Tiempo Real
          </button>
          <button
            className={`tab-btn ${activeTab === 'embed' ? 'active' : ''}`}
            onClick={() => handleTabClick('embed')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Dashboard Completo
          </button>
        </div>

        <div className="analytics-content">
          {activeTab === 'overview' && (
            <div className="analytics-section">
              <h3>Resumen de Google Analytics</h3>
              <div className="info-card">
                <div className="info-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                    <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                  </svg>
                </div>
                <h4>Configura Google Analytics</h4>
                <p>
                  Para ver las estadísticas completas de tu sitio web, necesitas configurar Google Analytics.
                </p>
                <div className="steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Crea una cuenta de Google Analytics</h5>
                      <p>Ve a <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">analytics.google.com</a> y crea una propiedad para tu sitio web.</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Obtén tu ID de medición</h5>
                      <p>Copia el ID de medición (formato: G-XXXXXXXXXX) desde la configuración de tu propiedad.</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Configuración ya incluida</h5>
                      <p>El código de Google Analytics ya está integrado en tu sitio. Solo necesitas añadir tu ID de medición al archivo index.html.</p>
                    </div>
                  </div>
                </div>
                <div className="analytics-status">
                  {window.gtag ? (
                    <div className="status-active">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      Google Analytics está activo
                    </div>
                  ) : (
                    <div className="status-inactive">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      Google Analytics no está configurado
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="analytics-section">
              <h3>Usuarios en Tiempo Real</h3>
              <div className="info-card">
                <p>
                  Para ver usuarios en tiempo real, visita tu panel de Google Analytics y selecciona
                  "Tiempo Real" en el menú lateral.
                </p>
                <a
                  href="https://analytics.google.com/analytics/web/#/realtime"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Abrir Google Analytics
                </a>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="analytics-section">
              <h3>Dashboard Completo de Google Analytics</h3>
              <div className="info-card">
                <p>
                  Accede a todas las métricas detalladas de tu sitio web en Google Analytics:
                </p>
                <ul className="features-list">
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Visitas y usuarios únicos
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Páginas más visitadas
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Fuentes de tráfico
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Comportamiento de usuarios
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Conversiones y objetivos
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Datos demográficos
                  </li>
                </ul>
                <a
                  href="https://analytics.google.com/analytics/web/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Abrir Google Analytics Dashboard
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
