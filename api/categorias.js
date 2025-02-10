import * as SQLite from 'expo-sqlite';

// Abrir la base de datos
const openDatabase = async () => {
  return await SQLite.openDatabaseAsync("sistemaInventario.db");
};

/** 🚀 Función para agregar una categoría */
export const agregarCategoria = async (nombre) => {
  try {
    const db = await openDatabase();
    const resultado = await db.runAsync(
      "INSERT INTO categorias (nombre) VALUES (?);",
      [nombre]
    );
    const categoria = { id: resultado.lastInsertRowId.toString(), nombre };
    console.log("✅ Categoría insertada:", categoria);
    return [categoria];
  } catch (error) {
    console.error("❌ Error al insertar categoría:", error);
    return [];
  }
};

/** 🚀 Función para eliminar una categoría */
export const eliminarCategoria = async (id) => {
  try {
    const db = await openDatabase();
    await db.runAsync("DELETE FROM categorias WHERE id = ?;", [id]);
    console.log(`✅ Categoría con ID ${id} eliminada correctamente`);
  } catch (error) {
    console.error("❌ Error al eliminar categoría:", error);
  }
};

/** 🚀 Función para actualizar una categoría */
export const actualizarCategoria = async (id, nuevoNombre) => {
  try {
    const db = await openDatabase();
    await db.runAsync(
      "UPDATE categorias SET nombre = ? WHERE id = ?;",
      [nuevoNombre, id]
    );
    console.log(`✅ Categoría con ID ${id} actualizada`);
  } catch (error) {
    console.error("❌ Error al actualizar categoría:", error);
  }
};

/** 🚀 Función para obtener todas las categorías */
export const obtenerCategorias = async () => {
  try {
    const db = await openDatabase();
    const resultado = await db.getAllAsync("SELECT id, nombre FROM categorias;");

    const categoriasProcesadas = resultado.map(({ id, nombre }) => ({
      id: id.toString(),
      nombre: nombre || "",
    }));

    console.log("📋 Categorías obtenidas:", categoriasProcesadas);
    return categoriasProcesadas;
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    return [];
  }
};