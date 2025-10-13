const API_URL = '/api';

export const obtenerProductos = async () => {
  try {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error('Error al obtener productos');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const crearPedido = async (pedidoData) => {
  try {
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData),
    });
    if (!response.ok) throw new Error('Error al crear pedido');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
