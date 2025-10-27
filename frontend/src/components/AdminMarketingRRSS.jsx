import React, { useState, useEffect } from 'react';
import '../styles/AdminMarketingRRSS.css';

const AdminMarketingRRSS = ({ onClose }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [publicando, setPublicando] = useState(false);
  const [textoCaption, setTextoCaption] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProductos(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleSeleccion = (productoId) => {
    setProductosSeleccionados((prevSeleccionados) => {
      if (prevSeleccionados.includes(productoId)) {
        return prevSeleccionados.filter((id) => id !== productoId);
      } else {
        return [...prevSeleccionados, productoId];
      }
    });
  };

  const seleccionarTodos = () => {
    if (productosSeleccionados.length === productos.length) {
      setProductosSeleccionados([]);
    } else {
      setProductosSeleccionados(productos.map((p) => p.id));
    }
  };

  const compartirEnInstagram = async () => {
    if (productosSeleccionados.length === 0) {
      setMensaje({ texto: 'Selecciona al menos un producto', tipo: 'error' });
      return;
    }

    setPublicando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      const resultados = [];

      for (const productoId of productosSeleccionados) {
        const producto = productos.find((p) => p.id === productoId);
        if (!producto) continue;

        // Recopilar todas las imágenes del producto
        const imagenesProducto = [];

        // Función para validar que no sea placeholder
        const esImagenValida = (url) => {
          if (!url) return false;
          if (url.includes('placeholder.com')) return false;
          if (url.includes('text=Sin')) return false;
          return true;
        };

        // Agregar imágenes principales
        if (producto.imagenes && producto.imagenes.length > 0) {
          producto.imagenes.forEach(img => {
            if (esImagenValida(img) && !imagenesProducto.includes(img)) {
              imagenesProducto.push(img);
            }
          });
        }

        // Agregar imágenes de variantes
        if (producto.variantes && producto.variantes.length > 0) {
          producto.variantes.forEach(variante => {
            if (variante.imagenes && variante.imagenes.length > 0) {
              variante.imagenes.forEach(img => {
                if (esImagenValida(img) && !imagenesProducto.includes(img)) {
                  imagenesProducto.push(img);
                }
              });
            }
          });
        }

        // Si tiene imagen única, agregarla
        if (producto.imagen && esImagenValida(producto.imagen) && !imagenesProducto.includes(producto.imagen)) {
          imagenesProducto.push(producto.imagen);
        }

        if (imagenesProducto.length === 0) {
          resultados.push({
            producto: producto.nombre,
            exito: false,
            error: 'No tiene imagen disponible'
          });
          continue;
        }

        // Determinar género según categoría padre
        let genero = '';
        if (producto.rutaCategoria) {
          if (producto.rutaCategoria.toLowerCase().includes('mujer')) {
            genero = 'Mujer';
          } else if (producto.rutaCategoria.toLowerCase().includes('hombre')) {
            genero = 'Hombre';
          }
        } else if (producto.descripcion) {
          if (producto.descripcion.toLowerCase().includes('mujer')) {
            genero = 'Mujer';
          } else if (producto.descripcion.toLowerCase().includes('hombre')) {
            genero = 'Hombre';
          }
        }

        const caption = textoCaption ||
          `🆕 Nueva llegada 🔥
¡Descubre nuestras nuev@s ${producto.categoria}, las llamamos... ${producto.nombre}! 🏃‍♂️👟

Comodidad, estilo y rendimiento en cada paso. 💥

${genero ? `Género: ${genero}` : ''}
✨ Disponible en diferentes tallas.
🎨 Varios Colores
📦 Envíos a todo el país / 🚚 Entrega rápida en 24h
👇 ¡Consíguelas ya!

Web: https://www.Shoelandia.es

#Zapatillas #Sneakers #Tendencia #ModaUrbana #StreetStyle #OutfitDelDía #Streetwear #Moda2025 #SneakerAddict #SneakerLovers`;

        console.log('📝 Caption generado:', caption);
        console.log('📝 textoCaption:', textoCaption);

        try {
          // Publicar en Instagram
          const response = await fetch('/api/instagram/publicar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              producto: producto,
              texto: caption,
              imagenesUrls: imagenesProducto,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al publicar');
          }

          const data = await response.json();

          // Incrementar el contador de Instagram
          await fetch(`/api/productos/${productoId}/instagram-share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          resultados.push({
            producto: producto.nombre,
            exito: true,
            postId: data.postId
          });

        } catch (err) {
          resultados.push({
            producto: producto.nombre,
            exito: false,
            error: err.message
          });
        }
      }

      // Recargar productos para actualizar contadores
      await cargarProductos();

      // Mostrar resultados
      const exitosos = resultados.filter(r => r.exito).length;
      const fallidos = resultados.filter(r => !r.exito).length;

      let textoMensaje = '';
      if (exitosos > 0) {
        textoMensaje += `✓ ${exitosos} producto(s) publicado(s) en Instagram. `;
      }
      if (fallidos > 0) {
        textoMensaje += `✗ ${fallidos} producto(s) fallaron. `;
        const errores = resultados.filter(r => !r.exito).map(r => `${r.producto}: ${r.error}`).join(', ');
        textoMensaje += `Errores: ${errores}`;
      }

      setMensaje({
        texto: textoMensaje,
        tipo: exitosos > 0 ? 'success' : 'error',
      });

      // Limpiar selección
      setProductosSeleccionados([]);
      setTextoCaption('');

    } catch (err) {
      setMensaje({ texto: err.message, tipo: 'error' });
    } finally {
      setPublicando(false);
    }
  };

  const obtenerImagenProducto = (producto) => {
    if (producto.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes[0];
    }
    if (producto.variantes && producto.variantes.length > 0) {
      for (const variante of producto.variantes) {
        if (variante.imagenes && variante.imagenes.length > 0) {
          return variante.imagenes[0];
        }
      }
    }
    return null;
  };

  if (loading) return <div className="admin-marketing-loading">Cargando productos...</div>;
  if (error) return <div className="admin-marketing-error">Error: {error}</div>;

  return (
    <div className="admin-marketing-overlay" onClick={onClose}>
      <div className="admin-marketing-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-marketing-header">
          <h2>Marketing RRSS - Instagram</h2>
          <button className="admin-marketing-close" onClick={onClose}>
            ×
          </button>
        </div>

        {mensaje.texto && (
          <div className={`admin-marketing-mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="admin-marketing-controles">
          <div className="controles-seleccion">
            <button onClick={seleccionarTodos} className="btn-seleccionar-todos">
              {productosSeleccionados.length === productos.length
                ? 'Deseleccionar Todos'
                : 'Seleccionar Todos'}
            </button>
            <span className="contador-seleccion">
              {productosSeleccionados.length} producto(s) seleccionado(s)
            </span>
          </div>

          <div className="controles-publicacion">
            <textarea
              className="caption-input"
              placeholder="Texto personalizado para Instagram (opcional)..."
              value={textoCaption}
              onChange={(e) => setTextoCaption(e.target.value)}
              rows={3}
            />
            <button
              onClick={compartirEnInstagram}
              className="btn-compartir-instagram"
              disabled={productosSeleccionados.length === 0 || publicando}
            >
              {publicando ? 'Publicando...' : `Compartir en RRSS (${productosSeleccionados.length})`}
            </button>
          </div>
        </div>

        <div className="productos-horizontal-container">
          {productos.map((producto) => {
            const imagenUrl = obtenerImagenProducto(producto);
            const seleccionado = productosSeleccionados.includes(producto.id);
            const instagramShares = producto.instagramShares || 0;

            return (
              <div
                key={producto.id}
                className={`producto-card-horizontal ${seleccionado ? 'seleccionado' : ''}`}
                onClick={() => toggleSeleccion(producto.id)}
              >
                <div className="producto-checkbox">
                  <input
                    type="checkbox"
                    checked={seleccionado}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="producto-imagen-container">
                  {imagenUrl ? (
                    <img src={imagenUrl} alt={producto.nombre} className="producto-imagen" />
                  ) : (
                    <div className="producto-sin-imagen">Sin imagen</div>
                  )}
                </div>

                <div className="producto-info">
                  <h4 className="producto-nombre">{producto.nombre}</h4>
                  <p className="producto-precio">{producto.precio}€</p>
                  <p className="producto-categoria">{producto.categoria}</p>

                  <div className="instagram-contador">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>{instagramShares} {instagramShares === 1 ? 'vez' : 'veces'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminMarketingRRSS;
