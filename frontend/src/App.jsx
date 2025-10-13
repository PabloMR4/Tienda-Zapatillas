import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { useCart } from './context/CartContext';

function App() {
  const [showCheckout, setShowCheckout] = useState(false);
  const { setIsCartOpen } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setShowCheckout(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  return (
    <div className="app">
      <Navbar />
      <Hero />
      <ProductGrid />
      <Cart onCheckout={handleCheckout} />
      {showCheckout && <Checkout onClose={handleCloseCheckout} />}

      <footer style={{
        background: '#1a1a1a',
        color: 'white',
        textAlign: 'center',
        padding: '3rem 2rem',
        marginTop: '6rem'
      }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2rem',
          marginBottom: '1rem',
          letterSpacing: '2px'
        }}>
          MODA
        </h3>
        <p style={{
          color: '#d4af37',
          fontSize: '0.8rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '2rem'
        }}>
          Luxury Fashion
        </p>
        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
          © 2024 MODA. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default App;
