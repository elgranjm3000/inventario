import * as SQLite from 'expo-sqlite';

// 📦 Abrir la base de datos
const openDatabase = async () => {
  return await SQLite.openDatabaseAsync("sistemaInventario.db");
};

/** 🚀 Función para registrar una nueva venta */
export const registrarVenta = async (fecha, cliente_id, total) => {
  try {
    const db = await openDatabase();
    const resultado = await db.runAsync(
      `INSERT INTO ventas (fecha, cliente_id, total) VALUES (?, ?, ?);`,
      [fecha, cliente_id, total]
    );

    const venta = {
      id: resultado.lastInsertRowId.toString(),
      fecha,
      cliente_id,
      total,
    };
    console.log("✅ Venta registrada:", venta);
    return venta;
  } catch (error) {
    console.error("❌ Error al registrar venta:", error);
    return null;
  }
};

/** 🚀 Función para agregar detalles de una venta */
export const agregarDetalleVenta = async (venta_id, producto_id, cantidad, precio_unitario) => {
  try {
    const db = await openDatabase();
    await db.runAsync(
      `INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?);`,
      [venta_id, producto_id, cantidad, precio_unitario]
    );

    console.log(`✅ Detalle de venta agregado: Venta ID ${venta_id}, Producto ID ${producto_id}`);
  } catch (error) {
    console.error("❌ Error al agregar detalle de venta:", error);
  }
};

/** 🚀 Función para obtener todas las ventas */
export const obtenerVentas = async () => {
  try {
    const db = await openDatabase();
    const resultado = await db.getAllAsync(
      `SELECT id, fecha, cliente_id, total FROM ventas;`
    );

    console.log("📋 Ventas obtenidas:", resultado);
    return resultado;
  } catch (error) {
    console.error("❌ Error al obtener ventas:", error);
    return [];
  }
};

/** 🚀 Función para obtener detalles de una venta específica */
export const obtenerDetallesVenta = async (venta_id) => {
  try {
    const db = await openDatabase();
    const resultado = await db.getAllAsync(
      `SELECT 
        dv.id, dv.venta_id, dv.producto_id, dv.cantidad, dv.precio_unitario, 
        p.nombre AS producto_nombre
      FROM detalles_venta dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?;`,
      [venta_id]
    );

    console.log(`📋 Detalles de venta obtenidos para venta ID ${venta_id}:`, resultado);
    return resultado;
  } catch (error) {
    console.error("❌ Error al obtener detalles de venta:", error);
    return [];
  }
};

/** 🚀 Función para eliminar una venta y sus detalles */
export const eliminarVenta = async (id) => {
  try {
    const db = await openDatabase();
    
    // Eliminar detalles de venta asociados
    await db.runAsync("DELETE FROM detalles_venta WHERE venta_id = ?;", [id]);
    
    // Eliminar la venta
    await db.runAsync("DELETE FROM ventas WHERE id = ?;", [id]);

    console.log(`✅ Venta con ID ${id} eliminada correctamente`);
  } catch (error) {
    console.error("❌ Error al eliminar venta:", error);
  }
};

/** 🚀 Función para actualizar una venta */
export const actualizarVenta = async (id, fecha, cliente_id, total) => {
  try {
    const db = await openDatabase();
    await db.runAsync(
      `UPDATE ventas SET fecha = ?, cliente_id = ?, total = ? WHERE id = ?;`,
      [fecha, cliente_id, total, id]
    );

    console.log(`✅ Venta con ID ${id} actualizada`);
  } catch (error) {
    console.error("❌ Error al actualizar venta:", error);
  }
};
