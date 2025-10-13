import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { getCartCount, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <h1>MODA</h1>
          <span className="logo-subtitle">Luxury Fashion</span>
        </div>

        <div className="navbar-links">
          <a href="#home">Inicio</a>
          <a href="#collection">Colección</a>
          <a href="#about">Sobre Nosotros</a>
          <a href="#contact">Contacto</a>
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
    </nav>
  );
};

export default Navbar;
