import db,{initDB} from './database';
import * as SQLite from 'expo-sqlite';

const openDatabase = async () => {
  return await SQLite.openDatabaseAsync("sistemaInventario.db");
};
export const agregarTest = async () => {
  try { 

    const db = await openDatabase();
    const resultado = await db.runAsync(
      "INSERT INTO ventas (producto, cantidad, total, fecha) VALUES (?, ?, ?, ?);",
      ["Producto A", 10, 200, "2024-02-04"]
       );
    console.log("✅ Venta de prueba agregada",resultado);

    const ingresos = await datab.runAsync(
      "INSERT INTO ingresos (descripcion, monto, fecha) VALUES (?, ?, ?);",
      ["Ingreso de prueba", 1500, "2024-02-04"]
    );
    console.log("✅ Ingreso de prueba agregado", ingresos);

  } catch (error) {
    console.error("❌ Error al insertar datos:", error);
  }
};


export const graficaVentas = async () => {
  try { 
    const db = await openDatabase();
    const resultado = await db.getAllAsync("SELECT fecha, total FROM ventas;");    
    const ventasAgrupadas = resultado.reduce((acc, { fecha, total }) => {
      acc[fecha] = (acc[fecha] || 0) + total;
      return acc;
    }, {});    
    const procesadas = Object.entries(ventasAgrupadas).map(([fecha, total]) => ({
      fecha,
      total,
    }));
    console.log("procesadas: ", procesadas);   
    return procesadas;

  } catch (error) {
    console.error("❌ Error al insertar datos:", error);
  }
};

// 📌 Proveedores
export const agregarProveedor = async(nombre, contacto, telefono, callback) => {

   try { 
    const db = await openDatabase();
    const resultado = await db.runAsync(
      "INSERT INTO proveedores (nombre, contacto, telefono) VALUES (?, ?, ?);",
      [nombre, contacto, telefono]
      );
    
    const proveedor = { id: resultado.lastInsertRowId.toString(), nombre: nombre };
    console.log("Proveedor insertado:", proveedor);
      
    return [proveedor];  // Retornamos el array con el proveedor insertado
  } catch (error) {
    console.error("❌ Error al insertar datos:", error);
  }
};

export const eliminarProveedor = async (id, callback) => {
  try {
    const db = await openDatabase();

    await db.runAsync("DELETE FROM proveedores WHERE id = ?;", [id]);

    console.log(`✅ Proveedor con ID ${id} eliminado correctamente`);

    if (callback) {
      callback(id); // Llamamos al callback para actualizar la UI si es necesario
    }
  } catch (error) {
    console.error("❌ Error al eliminar el proveedor:", error);
  }
};

export const actualizarProveedor = async (id, nuevoNombre, nuevoContacto, nuevoTelefono) => {
  try {
    const db = await openDatabase();    
     await db.runAsync(
      "UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ? WHERE id = ?",
      [nuevoNombre, nuevoContacto, nuevoTelefono, id]
    );
      console.log(`Proveedor con ID ${id} actualizado`);

  } catch (error) {
    console.error("❌ Error al actualizar proveedor:", error);
    return false;
  }
};

export const obtenerProveedores = async () => {
  try { 
    const db = await openDatabase();
    const resultado = await db.getAllAsync("SELECT id, contacto, nombre, telefono FROM proveedores;");
    console.log("resultado",resultado.nombre);
    // Procesar los datos en un array de objetos
    const proveedoresProcesados = resultado.map(({id,contacto,nombre,telefono}) => ({
      id:id, // Convierte a string y maneja null
      contacto, // Si es null, usa ""
      nombre, // Si es null, usa ""
      telefono, // Si es null, usa ""
    }));

    console.log("Proveedores: ", proveedoresProcesados);
    return proveedoresProcesados;

  } catch (error) {
    console.error("❌ Error al obtener proveedores:", error);
    return [];
  }
};

// 📌 Sucursales
export const agregarSucursal = (nombre, ubicacion, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT INTO sucursales (nombre, ubicacion) VALUES (?, ?);",
      [nombre, ubicacion],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error al agregar sucursal", error);
        callback(false);
      }
    );
  });
};

export const obtenerSucursales = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "SELECT * FROM sucursales;",
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => {
        console.error("Error al obtener sucursales", error);
        callback([]);
      }
    );
  });
};

// 📌 Ingresos
export const agregarIngreso = (descripcion, monto, fecha, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT INTO ingresos (descripcion, monto, fecha) VALUES (?, ?, ?);",
      [descripcion, monto, fecha],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error al agregar ingreso", error);
        callback(false);
      }
    );
  });
};

// 📌 Egresos
export const agregarEgreso = (descripcion, monto, fecha, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT INTO egresos (descripcion, monto, fecha) VALUES (?, ?, ?);",
      [descripcion, monto, fecha],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error al agregar egreso", error);
        callback(false);
      }
    );
  });
};

// 📌 Ventas
export const agregarVenta = (producto, cantidad, total, fecha, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT INTO ventas (producto, cantidad, total, fecha) VALUES (?, ?, ?, ?);",
      [producto, cantidad, total, fecha],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error al agregar venta", error);
        callback(false);
      }
    );
  });
};

// 📌 Almacenes y productos
export const agregarAlmacen = (nombre, ubicacion, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT INTO almacenes (nombre, ubicacion) VALUES (?, ?);",
      [nombre, ubicacion],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error al agregar almacén", error);
        callback(false);
      }
    );
  });
};

export const obtenerAlmacenes = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "SELECT * FROM almacenes;",
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => {
        console.error("Error al obtener almacenes", error);
        callback([]);
      }
    );
  });
};

export const agregarProducto = (nombre, descripcion, stock, precio, almacenId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT INTO productos (nombre, descripcion, stock, precio, almacen_id) VALUES (?, ?, ?, ?, ?);",
      [nombre, descripcion, stock, precio, almacenId],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error al agregar producto", error);
        callback(false);
      }
    );
  });
};

export const obtenerProductos = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT productos.*, almacenes.nombre AS almacen 
       FROM productos
       LEFT JOIN almacenes ON productos.almacen_id = almacenes.id;`,
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => {
        console.error("Error al obtener productos", error);
        callback([]);
      }
    );
  });
};

export const actualizarStock = (id, nuevoStock, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "UPDATE productos SET stock = ? WHERE id = ?;",
      [nuevoStock, id],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error al actualizar stock", error);
        callback(false);
      }
    );
  });
};

export const obtenerVentas = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "SELECT * FROM ventas;",
      [],
      (_, { rows }) => {
        console.log("Ventas obtenidas:", rows._array); // 👈 Verifica los datos
        callback(rows._array || []); // 👈 Asegura que siempre sea una lista
      },
      (_, error) => {
        console.log("Error al obtener ventas", error);
        callback([]); // 👈 Devuelve una lista vacía en caso de error
      }
    );
  });
};

export const obtenerIngresos = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "SELECT * FROM ingresos;",
      [],
      (_, { rows }) => {
        console.log("Ingresos obtenidos:", rows._array);
        callback(rows._array || []);
      },
      (_, error) => {
        console.log("Error al obtener ingresos", error);
        callback([]);
      }
    );
  });
};
