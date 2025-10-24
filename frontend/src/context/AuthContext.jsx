import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al cargar
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/clientes/session', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.usuario);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const registro = async (userData) => {
    try {
      const response = await fetch('/api/clientes/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al registrar');
      }

      setUser(data.usuario);
      return { success: true, mensaje: data.mensaje };
    } catch (error) {
      return { success: false, mensaje: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/clientes/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al iniciar sesión');
      }

      setUser(data.usuario);
      return { success: true, mensaje: data.mensaje };
    } catch (error) {
      return { success: false, mensaje: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/clientes/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
    }
  };

  const getPerfil = async () => {
    try {
      const response = await fetch('/api/clientes/perfil', {
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  };

  const updatePerfil = async (profileData) => {
    try {
      const response = await fetch('/api/clientes/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al actualizar perfil');
      }

      // Actualizar datos del usuario en el estado
      setUser(prev => ({
        ...prev,
        nombre: data.nombre,
        email: data.email
      }));

      return { success: true, mensaje: 'Perfil actualizado correctamente' };
    } catch (error) {
      return { success: false, mensaje: error.message };
    }
  };

  const getPedidos = async () => {
    try {
      const response = await fetch('/api/clientes/pedidos', {
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      return [];
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    registro,
    login,
    logout,
    getPerfil,
    updatePerfil,
    getPedidos,
    checkSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
