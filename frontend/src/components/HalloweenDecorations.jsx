import React from 'react';
import '../styles/Halloween.css';

const HalloweenDecorations = () => {
  return (
    <>
      {/* Overlay de Halloween */}
      <div className="halloween-overlay"></div>

      {/* Contenedor de decoraciones */}
      <div className="halloween-decorations">
        {/* Calabazas */}
        <div className="pumpkin pumpkin-1">🎃</div>
        <div className="pumpkin pumpkin-2">🎃</div>
        <div className="pumpkin pumpkin-3">🎃</div>

        {/* Murciélagos */}
        <div className="bat bat-1">🦇</div>
        <div className="bat bat-2">🦇</div>
        <div className="bat bat-3">🦇</div>

        {/* Fantasmas */}
        <div className="ghost ghost-1">👻</div>
        <div className="ghost ghost-2">👻</div>

        {/* Arañas */}
        <div className="spider spider-1">🕷️</div>
        <div className="spider spider-2">🕷️</div>

        {/* Luna */}
        <div className="moon">🌙</div>

        {/* Estrellas */}
        <div className="stars">
          <div className="star star-1">✨</div>
          <div className="star star-2">✨</div>
          <div className="star star-3">✨</div>
          <div className="star star-4">✨</div>
          <div className="star star-5">✨</div>
          <div className="star star-6">✨</div>
        </div>

        {/* Telarañas en las esquinas */}
        <div className="cobweb cobweb-top-left">🕸️</div>
        <div className="cobweb cobweb-top-right">🕸️</div>

        {/* Niebla */}
        <div className="fog"></div>
      </div>
    </>
  );
};

export default HalloweenDecorations;
