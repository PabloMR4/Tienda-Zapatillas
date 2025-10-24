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
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [descuentoCupon, setDescuentoCupon] = useState(0);

  const addToCart = (producto, variante) => {
    // Soporte para formato antiguo (talla como string) y nuevo (variante como objeto)
    const varianteObj = typeof variante === 'string'
      ? { id: 0, talla: variante, stock: 999 }
      : variante;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === producto.id && item.varianteId === varianteObj.id
      );

      if (existingItem) {
        // Verificar stock antes de incrementar
        if (existingItem.cantidad >= varianteObj.stock) {
          alert(`Stock máximo alcanzado: ${varianteObj.stock} unidades`);
          return prevItems;
        }
        return prevItems.map(item =>
          item.id === producto.id && item.varianteId === varianteObj.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...prevItems, {
        ...producto,
        varianteId: varianteObj.id,
        talla: varianteObj.talla,
        stockDisponible: varianteObj.stock,
        cantidad: 1
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, varianteId) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.id === id && item.varianteId === varianteId))
    );
  };

  const updateQuantity = (id, varianteId, cantidad) => {
    if (cantidad === 0) {
      removeFromCart(id, varianteId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id && item.varianteId === varianteId) {
          // Verificar stock
          if (cantidad > item.stockDisponible) {
            alert(`Stock máximo: ${item.stockDisponible} unidades`);
            return item;
          }
          return { ...item, cantidad };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCuponAplicado(null);
    setDescuentoCupon(0);
  };

  const aplicarCupon = async (codigoCupon) => {
    try {
      const response = await fetch('/api/descuentos/validar-cupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: codigoCupon,
          subtotal: getSubtotal()
        })
      });

      const data = await response.json();

      if (response.ok && data.valido) {
        setCuponAplicado(data.descuento);
        setDescuentoCupon(data.montoDescuento);
        return { success: true, message: 'Cupón aplicado correctamente', descuento: data.descuento };
      } else {
        return { success: false, message: data.mensaje || 'Cupón no válido' };
      }
    } catch (error) {
      console.error('Error al aplicar cupón:', error);
      return { success: false, message: 'Error al validar el cupón' };
    }
  };

  const eliminarCupon = () => {
    setCuponAplicado(null);
    setDescuentoCupon(0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const precio = item.descuento ? item.descuento.precioConDescuento : item.precio;
      return total + precio * item.cantidad;
    }, 0);
  };

  const getShippingCost = () => {
    const subtotal = getSubtotal();
    const FREE_SHIPPING_THRESHOLD = 50; // Envío gratuito a partir de 50€
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3.99;
  };

  const isFreeShipping = () => {
    const subtotal = getSubtotal();
    return subtotal >= 50;
  };

  const getCartTotal = () => {
    const subtotal = getSubtotal();
    const shipping = getShippingCost();
    const total = subtotal + shipping - descuentoCupon;
    return Math.max(0, total); // No permitir totales negativos
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
        getSubtotal,
        getShippingCost,
        isFreeShipping,
        getCartCount,
        isCartOpen,
        setIsCartOpen,
        cuponAplicado,
        descuentoCupon,
        aplicarCupon,
        eliminarCupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
