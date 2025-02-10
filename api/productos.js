import * as SQLite from 'expo-sqlite';

// Abrir la base de datos
const openDatabase = async () => {
  return await SQLite.openDatabaseAsync("sistemaInventario.db");
};

/** 🚀 Función para agregar un producto */
export const agregarProducto = async (
  nombre,
  descripcion,
  categoria_id,
  sku,
  precio,
  stock,
  stock_minimo,
  proveedor_id,
  imagen
) => {
  try {
    const db = await openDatabase();
    const resultado = await db.runAsync(
      `INSERT INTO productos (
        nombre, descripcion, categoria_id, sku, precio, stock, stock_minimo, proveedor_id, imagen
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [nombre, descripcion, categoria_id, sku, precio, stock, stock_minimo, proveedor_id, imagen]
    );

    const producto = {
      id: resultado.lastInsertRowId.toString(),
      nombre,
      descripcion,
      categoria_id,
      sku,
      precio,
      stock,
      stock_minimo,
      proveedor_id,
      imagen,
    };

    console.log("✅ Producto insertado:", producto);
    return [producto];
  } catch (error) {
    console.error("❌ Error al insertar producto:", error);
    return [];
  }
};

/** 🚀 Función para eliminar un producto */
export const eliminarProducto = async (id) => {
  try {
    const db = await openDatabase();
    await db.runAsync("DELETE FROM productos WHERE id = ?;", [id]);
    console.log(`✅ Producto con ID ${id} eliminado correctamente`);
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
  }
};

/** 🚀 Función para actualizar un producto */
export const actualizarProducto = async (
  id,
  nombre,
  descripcion,
  categoria_id,
  sku,
  precio,
  stock,
  stock_minimo,
  proveedor_id,
  imagen
) => {
  try {
    const db = await openDatabase();
    await db.runAsync(
      `UPDATE productos SET 
        nombre = ?, 
        descripcion = ?, 
        categoria_id = ?, 
        sku = ?, 
        precio = ?, 
        stock = ?, 
        stock_minimo = ?, 
        proveedor_id = ?, 
        imagen = ?
      WHERE id = ?;`,
      [nombre, descripcion, categoria_id, sku, precio, stock, stock_minimo, proveedor_id, imagen, id]
    );

    console.log(`✅ Producto con ID ${id} actualizado`);
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
  }
};

/** 🚀 Función para obtener todos los productos */
export const obtenerProductos = async () => {
  try {
    const db = await openDatabase();
    const resultado = await db.getAllAsync(`
      SELECT 
        id, 
        nombre, 
        descripcion, 
        categoria_id, 
        sku, 
        precio, 
        stock, 
        stock_minimo, 
        proveedor_id, 
        imagen 
      FROM productos;
    `);

    const productosProcesados = resultado.map((producto) => ({
      id: producto.id.toString(),
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      categoria_id: producto.categoria_id || null,
      sku: producto.sku || "",
      precio: producto.precio || 0,
      stock: producto.stock || 0,
      stock_minimo: producto.stock_minimo || 0,
      proveedor_id: producto.proveedor_id || null,
      imagen: producto.imagen || "",
    }));

    console.log("📋 Productos obtenidos:", productosProcesados);
    return productosProcesados;
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    return [];
  }
};

/** 🚀 Función para obtener un producto por su ID */
export const obtenerProductoPorId = async (id) => {
  try {
    const db = await openDatabase();
    const resultado = await db.getFirstAsync(
      `SELECT 
        id, 
        nombre, 
        descripcion, 
        categoria_id, 
        sku, 
        precio, 
        stock, 
        stock_minimo, 
        proveedor_id, 
        imagen 
      FROM productos 
      WHERE id = ?;`,
      [id]
    );

    if (resultado) {
      const producto = {
        id: resultado.id.toString(),
        nombre: resultado.nombre || "",
        descripcion: resultado.descripcion || "",
        categoria_id: resultado.categoria_id || null,
        sku: resultado.sku || "",
        precio: resultado.precio || 0,
        stock: resultado.stock || 0,
        stock_minimo: resultado.stock_minimo || 0,
        proveedor_id: resultado.proveedor_id || null,
        imagen: resultado.imagen || "",
      };

      console.log("📋 Producto obtenido:", producto);
      return producto;
    } else {
      console.log("❌ Producto no encontrado");
      return null;
    }
  } catch (error) {
    console.error("❌ Error al obtener producto por ID:", error);
    return null;
  }
};