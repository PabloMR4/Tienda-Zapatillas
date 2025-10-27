import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { obtenerProductos } from '../services/api';
import '../styles/Navbar.css';

const Navbar = ({ onOpenLogin, onOpenProfile, onOpenContact, onOpenAdminDescuentos, onOpenAdminAnalytics, onOpenAdminMarketingRRSS }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount, setIsCartOpen } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [menuTimeout, setMenuTimeout] = useState(null);
  const [adminMenuTimeout, setAdminMenuTimeout] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const productos = await obtenerProductos();
      const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];
      setCategorias(categoriasUnicas);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const formatearNombreCategoria = (categoria) => {
    return categoria
      .split(/[-\s]+/)
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  const handleMouseEnter = () => {
    if (menuTimeout) {
      clearTimeout(menuTimeout);
    }
    setShowProductsMenu(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowProductsMenu(false);
    }, 300); // 300ms de retraso antes de cerrar
    setMenuTimeout(timeout);
  };

  const handleAdminMouseEnter = () => {
    if (adminMenuTimeout) {
      clearTimeout(adminMenuTimeout);
    }
    setShowAdminMenu(true);
  };

  const handleAdminMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowAdminMenu(false);
    }, 300);
    setAdminMenuTimeout(timeout);
  };

  const handleNavClick = (section) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <div className="promo-banner">
        <div className="promo-banner-content">
          <span className="promo-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Envíos en 24h
          </span>
          <span className="promo-divider">|</span>
          <span className="promo-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            Envío GRATIS en pedidos +50€
          </span>
        </div>
      </div>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <h1>Shoe<span className="logo-dot">·</span>Landia</h1>
          </div>

          <div className="navbar-links">
            <a href="#home" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Inicio</a>

            {/* Menú desplegable de Productos */}
            <div
              className="navbar-dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <a href="#productos" onClick={(e) => e.preventDefault()} className="dropdown-trigger">
                Productos
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`dropdown-arrow ${showProductsMenu ? 'open' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </a>

              {showProductsMenu && (
                <div
                  className="dropdown-menu"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="dropdown-header">Nuestras Categorías</div>
                  {categorias.map((categoria, index) => (
                    <a
                      key={index}
                      href={`/categoria/${categoria}`}
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/categoria/${categoria}`);
                        setShowProductsMenu(false);
                        if (menuTimeout) {
                          clearTimeout(menuTimeout);
                        }
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                      {formatearNombreCategoria(categoria)}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="#about" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>Sobre Nosotros</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); onOpenContact(); }}>Contacto</a>
            {isAuthenticated && user?.rol === 'admin' && (
              <div
                className="navbar-dropdown"
                onMouseEnter={handleAdminMouseEnter}
                onMouseLeave={handleAdminMouseLeave}
              >
                <a href="#admin" onClick={(e) => e.preventDefault()} className="dropdown-trigger admin-link">
                  Admin
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`dropdown-arrow ${showAdminMenu ? 'open' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </a>

                {showAdminMenu && (
                  <div
                    className="dropdown-menu"
                    onMouseEnter={handleAdminMouseEnter}
                    onMouseLeave={handleAdminMouseLeave}
                  >
                    <div className="dropdown-header">Panel de Administración</div>
                    <a
                      href="#admin-descuentos"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenAdminDescuentos();
                        setShowAdminMenu(false);
                        if (adminMenuTimeout) {
                          clearTimeout(adminMenuTimeout);
                        }
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83m13.79-4l-5.74 9.94"/>
                      </svg>
                      Descuentos
                    </a>
                    <a
                      href="#admin-analytics"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenAdminAnalytics();
                        setShowAdminMenu(false);
                        if (adminMenuTimeout) {
                          clearTimeout(adminMenuTimeout);
                        }
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                      Analíticas
                    </a>
                    <a
                      href="#admin-marketing-rrss"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenAdminMarketingRRSS();
                        setShowAdminMenu(false);
                        if (adminMenuTimeout) {
                          clearTimeout(adminMenuTimeout);
                        }
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                      Marketing RRSS
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="navbar-actions">
            <div
              className="navbar-user"
              onClick={isAuthenticated ? onOpenProfile : onOpenLogin}
              title={isAuthenticated ? `Mi cuenta - ${user?.nombre}` : 'Iniciar sesión'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {isAuthenticated && (
                <span className="user-indicator"></span>
              )}
            </div>

            <div className="navbar-cart" onClick={() => setIsCartOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 2L7.17 4H3v2h18V4h-4.17L15 2H9zm-5 6v13h16V8H4z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
