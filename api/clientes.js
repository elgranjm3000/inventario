import db,{initDB} from '../database';
import * as SQLite from 'expo-sqlite';

const openDatabase = async () => {
    return await SQLite.openDatabaseAsync("sistemaInventario.db");
};

/** 🚀 Función para agregar un cliente */
export const agregarCliente = async (nombre, telefono, email, direccion) => {
    try {
      const db = await openDatabase();
      const resultado = await db.runAsync(
        "INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?);",
        [nombre, telefono, email, direccion]
      );  
      const cliente = { id: resultado.lastInsertRowId.toString(), nombre };
      console.log("✅ Cliente insertado:", cliente);  
      return [cliente];
    } catch (error) {
      console.error("❌ Error al insertar cliente:", error);
      return [];
    }
  };
  
  /** 🚀 Función para eliminar un cliente */
  export const eliminarCliente = async (id) => {
    try {
      const db = await openDatabase();
      await db.runAsync("DELETE FROM clientes WHERE id = ?;", [id]);
  
      console.log(`✅ Cliente con ID ${id} eliminado correctamente`);
    } catch (error) {
      console.error("❌ Error al eliminar cliente:", error);
    }
  };
  
  /** 🚀 Función para actualizar un cliente */
  export const actualizarCliente = async (id, nuevoNombre, nuevoTelefono, nuevoEmail, nuevaDireccion) => {
    try {
      const db = await openDatabase();
      await db.runAsync(
        "UPDATE clientes SET nombre = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?;",
        [nuevoNombre, nuevoTelefono, nuevoEmail, nuevaDireccion, id]
      );
      console.log(`✅ Cliente con ID ${id} actualizado`);
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error);
    }
  };
  
  /** 🚀 Función para obtener todos los clientes */
  export const obtenerClientes = async () => {
    try {
      const db = await openDatabase();
      const resultado = await db.getAllAsync("SELECT id, nombre, telefono, email, direccion FROM clientes;");
  
      const clientesProcesados = resultado.map(({ id, nombre, telefono, email, direccion }) => ({
        id: id.toString(),
        nombre: nombre || "",
        telefono: telefono || "",
        email: email || "",
        direccion: direccion || "",
      }));
  
      console.log("📋 Clientes obtenidos:", clientesProcesados);
      return clientesProcesados;
    } catch (error) {
      console.error("❌ Error al obtener clientes:", error);
      return [];
    }
  };

  export const obtenerClientePorId = async (id) => {
    try {
      const db = await openDatabase();
      const resultado = await db.getFirstAsync(
        `SELECT 
          id, 
          nombre, 
          telefono, 
          email, 
          direccion 
        FROM clientes 
        WHERE id = ?;`,
        [id]
      );
  
      if (resultado) {
        const cliente = {
          id: resultado.id.toString(),
          nombre: resultado.nombre || "",
          telefono: resultado.telefono || "",
          email: resultado.email || "",
          direccion: resultado.direccion || "",
        };
  
        console.log("📋 Cliente obtenido:", cliente);
        return cliente;
      } else {
        console.log("❌ Cliente no encontrado");
        return null;
      }
    } catch (error) {
      console.error("❌ Error al obtener cliente por ID:", error);
      return null;
    }
  };
  