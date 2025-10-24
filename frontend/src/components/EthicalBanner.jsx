import React from 'react';
import '../styles/EthicalBanner.css';

const EthicalBanner = () => {
  return (
    <section className="ethical-banner">
      <div className="ethical-container">
        <div className="ethical-image">
          <img
            src="https://zapazone.com/cdn/shop/files/Choose-Cruelty-Free-logo-1024x512_750x.webp?v=1696759395"
            alt="Cruelty Free - Moda sin crueldad animal"
          />
        </div>
        <div className="ethical-content">
          <h2 className="ethical-title">Paso a paso hacia un mundo más compasivo</h2>
          <p className="ethical-description">
            En nuestra tienda de zapatos, cada par está diseñado sin crueldad hacia los animales.
            Encuentra la elegancia y la ética en cada paso que das. Únete a nosotros en esta caminata
            hacia la moda consciente. 🌿 👠
          </p>
        </div>
      </div>
    </section>
  );
};

export default EthicalBanner;
