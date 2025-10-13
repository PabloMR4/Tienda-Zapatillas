import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (producto, talla) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === producto.id && item.talla === talla
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === producto.id && item.talla === talla
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...prevItems, { ...producto, talla, cantidad: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, talla) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.id === id && item.talla === talla))
    );
  };

  const updateQuantity = (id, talla, cantidad) => {
    if (cantidad === 0) {
      removeFromCart(id, talla);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.talla === talla
          ? { ...item, cantidad }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const precio = item.descuento ? item.descuento.precioConDescuento : item.precio;
      return total + precio * item.cantidad;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.cantidad, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
