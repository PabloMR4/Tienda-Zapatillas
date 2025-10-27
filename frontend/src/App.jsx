import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import CategoryPage from './components/CategoryPage';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Footer from './components/Footer';
import HalloweenDecorations from './components/HalloweenDecorations';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import Contact from './components/Contact';
import AdminDescuentos from './components/AdminDescuentos';
import AdminAnalytics from './components/AdminAnalytics';
import AdminMarketingRRSS from './components/AdminMarketingRRSS';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

function App() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAdminDescuentos, setShowAdminDescuentos] = useState(false);
  const [showAdminAnalytics, setShowAdminAnalytics] = useState(false);
  const [showAdminMarketingRRSS, setShowAdminMarketingRRSS] = useState(false);
  const { setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setShowCheckout(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
    setShowProfile(false);
  };

  const handleOpenRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
    setShowProfile(false);
  };

  const handleOpenProfile = () => {
    setShowProfile(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleCloseAuth = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowProfile(false);
  };

  const handleOpenContact = () => {
    setShowContact(true);
  };

  const handleCloseContact = () => {
    setShowContact(false);
  };

  const handleOpenAdminDescuentos = () => {
    setShowAdminDescuentos(true);
  };

  const handleCloseAdminDescuentos = () => {
    setShowAdminDescuentos(false);
  };

  const handleOpenAdminAnalytics = () => {
    setShowAdminAnalytics(true);
  };

  const handleCloseAdminAnalytics = () => {
    setShowAdminAnalytics(false);
  };

  const handleOpenAdminMarketingRRSS = () => {
    setShowAdminMarketingRRSS(true);
  };

  const handleCloseAdminMarketingRRSS = () => {
    setShowAdminMarketingRRSS(false);
  };

  return (
    <div className="app">
      <HalloweenDecorations />
      <Navbar
        onOpenLogin={handleOpenLogin}
        onOpenProfile={handleOpenProfile}
        onOpenContact={handleOpenContact}
        onOpenAdminDescuentos={handleOpenAdminDescuentos}
        onOpenAdminAnalytics={handleOpenAdminAnalytics}
        onOpenAdminMarketingRRSS={handleOpenAdminMarketingRRSS}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categoria/:categoria" element={<CategoryPage />} />
      </Routes>
      <Cart onCheckout={handleCheckout} />
      {showCheckout && <Checkout onClose={handleCloseCheckout} />}
      {showLogin && (
        <Login
          onClose={handleCloseAuth}
          onSwitchToRegister={handleOpenRegister}
        />
      )}
      {showRegister && (
        <Register
          onClose={handleCloseAuth}
          onSwitchToLogin={handleOpenLogin}
        />
      )}
      {showProfile && <UserProfile onClose={handleCloseAuth} />}
      {showContact && <Contact onClose={handleCloseContact} />}
      {showAdminDescuentos && <AdminDescuentos onClose={handleCloseAdminDescuentos} />}
      {showAdminAnalytics && <AdminAnalytics onClose={handleCloseAdminAnalytics} />}
      {showAdminMarketingRRSS && <AdminMarketingRRSS onClose={handleCloseAdminMarketingRRSS} />}
      <Footer />
    </div>
  );
}

export default App;
