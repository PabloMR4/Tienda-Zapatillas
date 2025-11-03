import React, { useState, useEffect, lazy, Suspense } from 'react';
import '../styles/VansCustomization.css';

// Lazy load del visualizador 3D
const Shoe3DViewer = lazy(() => import('./Shoe3DViewer').catch(() => ({
  default: () => (
    <div style={{
      width: '100%',
      height: '600px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: '20px'
    }}>
      <p style={{ color: '#666' }}>Error al cargar el visualizador 3D</p>
    </div>
  )
})));

const VansCustomization = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [customDesign, setCustomDesign] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setUploadedImage(imageUrl);
        setCustomDesign(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearDesign = () => {
    setCustomDesign(null);
    setUploadedImage(null);
  };

  return (
    <div className="vans-customization">
      <div className="vans-hero">
        <div className="vans-hero-overlay"></div>
        <div className="vans-hero-content">
          <h1 className="vans-hero-title">Personalización Premium de Vans</h1>
          <p className="vans-hero-subtitle">
            Crea zapatillas únicas que reflejen tu estilo personal
          </p>
        </div>
      </div>

      <div className="vans-container">
        <div className="vans-intro">
          <div className="vans-intro-content">
            <span className="vans-tag">Exclusivo</span>
            <h2 className="vans-intro-title">Tu Diseño, Tus Reglas</h2>
            <p className="vans-intro-description">
              En ShoeLandia, transformamos tus ideas en realidad. Nuestro servicio de personalización
              premium te permite diseñar tus Vans perfectas desde cero. Elige colores, materiales,
              estampados y detalles únicos que nadie más tendrá.
            </p>

            <div className="vans-features">
              <div className="vans-feature">
                <div className="vans-feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3>Materiales Premium</h3>
                <p>Selección exclusiva de materiales de alta calidad</p>
              </div>

              <div className="vans-feature">
                <div className="vans-feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                  </svg>
                </div>
                <h3>Diseño Personalizado</h3>
                <p>Cada detalle pensado para ti</p>
              </div>

              <div className="vans-feature">
                <div className="vans-feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <h3>Artesanía Experta</h3>
                <p>Confeccionadas con precisión y cuidado</p>
              </div>
            </div>
          </div>

          <div className="vans-intro-image">
            <img
              src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80"
              alt="Vans personalizadas"
            />
          </div>
        </div>

        <div className="vans-process">
          <h2 className="vans-section-title">Cómo Funciona</h2>
          <div className="vans-steps">
            <div className="vans-step">
              <div className="vans-step-number">1</div>
              <h3>Completa el Formulario</h3>
              <p>Cuéntanos tus ideas y preferencias</p>
            </div>
            <div className="vans-step">
              <div className="vans-step-number">2</div>
              <h3>Consulta Personalizada</h3>
              <p>Nuestro equipo te contactará para refinar tu diseño</p>
            </div>
            <div className="vans-step">
              <div className="vans-step-number">3</div>
              <h3>Producción Artesanal</h3>
              <p>Creamos tus zapatillas con atención al detalle</p>
            </div>
            <div className="vans-step">
              <div className="vans-step-number">4</div>
              <h3>Entrega Exclusiva</h3>
              <p>Recibe tus Vans únicas en 2-3 semanas</p>
            </div>
          </div>
        </div>

        <div className="vans-3d-section">
          <h2 className="vans-section-title">Visualizador 3D de Converse</h2>
          <p className="vans-section-subtitle">
            Sube tu diseño y visualízalo en tiempo real en una zapatilla Converse 3D
          </p>

          <div className="vans-3d-container">
            <div className="vans-3d-viewer">
              <Suspense fallback={
                <div style={{
                  width: '100%',
                  height: '600px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: '20px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                    <p style={{ color: '#666' }}>Cargando visualizador 3D...</p>
                  </div>
                </div>
              }>
                <Shoe3DViewer customDesign={customDesign} />
              </Suspense>
            </div>

            <div className="vans-3d-controls">
              <div className="vans-control-card">
                <h3>Sube tu Diseño</h3>
                <p>Carga una imagen con tu diseño personalizado y visualízalo aplicado en la zapatilla</p>

                <div className="vans-upload-area">
                  <input
                    type="file"
                    id="design-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="design-upload" className="vans-upload-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {uploadedImage ? 'Cambiar Diseño' : 'Cargar Imagen'}
                  </label>

                  {uploadedImage && (
                    <div className="vans-uploaded-preview">
                      <img src={uploadedImage} alt="Diseño cargado" />
                      <button onClick={handleClearDesign} className="vans-clear-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Limpiar
                      </button>
                    </div>
                  )}
                </div>

                <div className="vans-tips">
                  <h4>Consejos para mejores resultados:</h4>
                  <ul>
                    <li>Usa imágenes de alta resolución (mínimo 1000x1000px)</li>
                    <li>Formatos recomendados: PNG, JPG o SVG</li>
                    <li>Diseños con fondos transparentes funcionan mejor</li>
                    <li>Puedes rotar la zapatilla arrastrando con el mouse</li>
                  </ul>
                </div>
              </div>

              <div className="vans-control-card vans-colors-card">
                <h4>Diseños Predefinidos</h4>
                <p>O prueba algunos de nuestros diseños de ejemplo</p>
                <div className="vans-preset-designs">
                  <button
                    className="vans-preset-btn"
                    onClick={() => setCustomDesign('https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&auto=format&fit=crop&q=80')}
                  >
                    Galaxia
                  </button>
                  <button
                    className="vans-preset-btn"
                    onClick={() => setCustomDesign('https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&auto=format&fit=crop&q=80')}
                  >
                    Abstracto
                  </button>
                  <button
                    className="vans-preset-btn"
                    onClick={() => setCustomDesign('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80')}
                  >
                    Arte
                  </button>
                  <button
                    className="vans-preset-btn"
                    onClick={() => setCustomDesign('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop&q=80')}
                  >
                    Flores
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="vans-info">
          <div className="vans-info-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <h3>Tiempo de Producción</h3>
            <p>2-3 semanas desde la confirmación del diseño</p>
          </div>

          <div className="vans-info-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h3>Consultas</h3>
            <p>Contacta con nosotros para cualquier duda sobre el proceso</p>
          </div>

          <div className="vans-info-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <h3>Garantía de Satisfacción</h3>
            <p>Revisiones del diseño hasta que quede perfecto</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VansCustomization;
