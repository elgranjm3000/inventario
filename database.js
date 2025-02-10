import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

console.log("INICIANDO");
console.log(SQLite);

let db;


// Función para inicializar la base de datos
export const initDB = async () => {
  try {
    db = await SQLite.openDatabaseAsync('sistemaInventario.db');
    console.log('Base de datos abierta');
  } catch (error) {
    console.error('Error al abrir la base de datos', error);
  }
};

// Crear las tablas si no existen
export const setupDatabase = async () => {
  if (!db) {
    console.error('La base de datos no está inicializada');
    return;
  }
  await db.execAsync('PRAGMA foreign_keys = ON');

  const queries = [
    `CREATE TABLE IF NOT EXISTS proveedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      contacto TEXT,
      telefono TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );`,
    `CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT,
      email TEXT UNIQUE,
      direccion TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      categoria_id INTEGER,
      sku TEXT UNIQUE, 
      precio REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      stock_minimo INTEGER DEFAULT 0,
      proveedor_id INTEGER,
      imagen TEXT, 
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
      FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      total REAL NOT NULL,
      metodo_pago TEXT NOT NULL,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
    );`,    
    `CREATE TABLE IF NOT EXISTS detalle_ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venta_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proveedor_id INTEGER NOT NULL,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      total REAL NOT NULL,
      FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS detalle_compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compra_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS movimientos_inventario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER NOT NULL,
      tipo_movimiento TEXT CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste')) NOT NULL,
      cantidad INTEGER NOT NULL,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      referencia TEXT, 
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      contraseña TEXT NOT NULL,
      rol TEXT CHECK (rol IN ('admin', 'vendedor', 'almacenista')) NOT NULL
    );`
  ];

  try {
    await db.execAsync(queries.join(' '));
    console.log('Tablas creadas o verificadas correctamente');
  } catch (error) {
    console.error('Error al crear/verificar tablas', error);
  }
};

// Inicializar la base de datos al cargar el módulo
initDB();

export default db;
