import React, { useState, useEffect,useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';

import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { Card, IconButton } from 'react-native-paper';
import { Button, TextInput, Portal, Modal } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import {
  agregarProducto as agregarProductoService,
  eliminarProducto as eliminarProductoService,
  actualizarProducto as actualizarProductoService,
  obtenerProductos as obtenerProductosService   
} from '../../api/productos';

import { obtenerCategorias as obtenerCategoriasService } from '../../api/categorias';
import { obtenerProveedores as obtenerProveedoresService, } from '../../databaseService';

const ITEMS_POR_PAGINA = 10;

// Pantalla para listar productos
function ListaProductosScreen({ productos, cargarProductos, categorias, proveedores }) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');
  const [nuevoStockMinimo, setNuevoStockMinimo] = useState('');
  const [nuevoSku, setNuevoSku] = useState('');
  const [nuevaCategoriaId, setNuevaCategoriaId] = useState(null);
  const [nuevoProveedorId, setNuevoProveedorId] = useState(null);
  const [nuevaImagen, setNuevaImagen] = useState('');

  useEffect(() => {
    filtrarProductos();
  }, [busqueda, paginaActual, productos]);

  const filtrarProductos = () => {
    let filtrados = productos;

    // Filtrar por nombre
    if (busqueda.trim() !== "") {
      filtrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Aplicar paginación
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    setProductosFiltrados(filtrados.slice(inicio, fin));
  };

  const eliminarProducto = (id) => {
    Alert.alert('Confirmar eliminación', '¿Estás seguro de que deseas eliminar este producto?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            await eliminarProductoService(id);
            await cargarProductos();
          } catch (error) {
            console.error("❌ Error al eliminar producto:", error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const abrirModalEdicion = (producto) => {
    setProductoEditando(producto);
    setNuevoNombre(producto.nombre);
    setNuevaDescripcion(producto.descripcion);
    setNuevoPrecio(producto.precio.toString());
    setNuevoStock(producto.stock.toString());
    setNuevoStockMinimo(producto.stock_minimo.toString());
    setNuevoSku(producto.sku);
    setNuevaCategoriaId(producto.categoria_id);
    setNuevoProveedorId(producto.proveedor_id);
    setNuevaImagen(producto.imagen);
    setModalVisible(true);
  };

  const guardarEdicion = async () => {
    await actualizarProductoService(
      productoEditando.id,
      nuevoNombre,
      nuevaDescripcion,
      nuevaCategoriaId,
      nuevoSku,
      parseFloat(nuevoPrecio),
      parseInt(nuevoStock),
      parseInt(nuevoStockMinimo),
      nuevoProveedorId,
      nuevaImagen
    );
    setModalVisible(false);
    await cargarProductos();
  };

  return (
    <View style={styles.container}>
      {/* Campo de búsqueda */}
      <TextInput
        mode="outlined"
        label="Buscar producto..."
        value={busqueda}
        onChangeText={(texto) => setBusqueda(texto)}
        style={styles.input}
        left={<TextInput.Icon icon="magnify" />}
      />

      {/* Lista de productos */}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>{item.nombre}</Text>
              <Text style={styles.subtitle}>📦 SKU: {item.sku}</Text>
              <Text style={styles.subtitle}>💰 Precio: ${item.precio}</Text>
              <Text style={styles.subtitle}>📥 Stock: {item.stock}</Text>
              <Text style={styles.subtitle}>📉 Stock mínimo: {item.stock_minimo}</Text>
              <Text style={styles.subtitle}>🏷️ Categoría: {categorias.find(c => c.id == item.categoria_id)?.nombre || "Sin categoría"}</Text>
              <Text style={styles.subtitle}>📞 Proveedor: {proveedores.find(p => p.id === item.proveedor_id)?.nombre || "Sin proveedor"}</Text>
            </Card.Content>
            <Card.Actions>
              <IconButton
                icon="pencil"
                color="#1976D2"
                onPress={() => abrirModalEdicion(item)}
              />
              <IconButton
                icon="delete"
                color="#d32f2f"
                onPress={() => eliminarProducto(item.id)}
              />
            </Card.Actions>
          </Card>
        )}
      />

      {/* Controles de paginación */}
      <View style={styles.pagination}>
        <Button
          mode="contained"
          icon="arrow-left"
          disabled={paginaActual === 1}
          onPress={() => setPaginaActual((prev) => prev - 1)}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Anterior
        </Button>

        <Text style={styles.pageNumber}>Página {paginaActual}</Text>

        <Button
          mode="contained"
          icon="arrow-right"
          disabled={productos.length <= paginaActual * ITEMS_POR_PAGINA}
          onPress={() => setPaginaActual((prev) => prev + 1)}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Siguiente
        </Button>
      </View>

      {/* Modal para Editar */}
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Editar Producto</Text>
          <TextInput
            style={styles.input}
            value={nuevoNombre}
            onChangeText={setNuevoNombre}
            placeholder="Nombre"
          />
          <TextInput
            style={styles.input}
            value={nuevaDescripcion}
            onChangeText={setNuevaDescripcion}
            placeholder="Descripción"
          />
          <TextInput
            style={styles.input}
            value={nuevoPrecio}
            onChangeText={setNuevoPrecio}
            placeholder="Precio"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={nuevoStock}
            onChangeText={setNuevoStock}
            placeholder="Stock"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={nuevoStockMinimo}
            onChangeText={setNuevoStockMinimo}
            placeholder="Stock mínimo"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={nuevoSku}
            onChangeText={setNuevoSku}
            placeholder="SKU"
          />
          <TextInput
            style={styles.input}
            value={nuevaImagen}
            onChangeText={setNuevaImagen}
            placeholder="Imagen (URL)"
          />
          
          <Picker
            selectedValue={nuevaCategoriaId}
            onValueChange={(itemValue) => setNuevaCategoriaId(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione una categoría" value={null} />
            {categorias.map((categoria) => (
              <Picker.Item key={categoria.id} label={categoria.nombre} value={categoria.id} />
            ))}
          </Picker>
          <Picker
            selectedValue={nuevoProveedorId}
            onValueChange={(itemValue) => setNuevoProveedorId(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un proveedor" value={null} />
            {proveedores.map((proveedor) => (
              <Picker.Item key={proveedor.id} label={proveedor.nombre} value={proveedor.id} />
            ))}
          </Picker>
          <Button mode="contained" onPress={guardarEdicion} style={styles.saveButton}>Guardar</Button>
        </Modal>
      </Portal>
    </View>
  );
}

// Pantalla para agregar un nuevo producto
function AgregarProductoScreen({ agregarProducto, categorias, proveedores }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [sku, setSku] = useState("");
  const [categoriaId, setCategoriaId] = useState(null);
  const [proveedorId, setProveedorId] = useState(null);
  const [imagen, setImagen] = useState("");

  const handleAgregar = async () => {
    if (
      nombre.trim() === "" ||
      precio.trim() === "" ||
      stock.trim() === "" ||
      sku.trim() === ""
    ) {
      return alert("Los campos obligatorios no pueden estar vacíos");
    }

    try {
      const producto = {
        nombre,
        descripcion,
        categoria_id: categoriaId,
        sku,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        stock_minimo: parseInt(stockMinimo),
        proveedor_id: proveedorId,
        imagen,
      };
      await agregarProducto(producto);
      alert('Producto agregado exitosamente');
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setStock("");
      setStockMinimo("");
      setSku("");
      setCategoriaId(null);
      setProveedorId(null);
      setImagen("");
    } catch (error) {
      console.error("❌ Error al guardar producto:", error);
      alert('Hubo un error al guardar el producto');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre del producto"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Descripción del producto"
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.input}
      />
      <TextInput
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Stock"
        value={stock}
        onChangeText={setStock}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Stock mínimo"
        value={stockMinimo}
        onChangeText={setStockMinimo}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="SKU"
        value={sku}
        onChangeText={setSku}
        style={styles.input}
      />
      <TextInput
        placeholder="Imagen (URL)"
        value={imagen}
        onChangeText={setImagen}
        style={styles.input}
      />
      <Picker
        selectedValue={categoriaId}
        onValueChange={(itemValue) => setCategoriaId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione una categoría" value={null} />
        {categorias.map((categoria) => (
          <Picker.Item key={categoria.id} label={categoria.nombre} value={categoria.id} />
        ))}
      </Picker>
      <Picker
        selectedValue={proveedorId}
        onValueChange={(itemValue) => setProveedorId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione un proveedor" value={null} />
        {proveedores.map((proveedor) => (           
          <Picker.Item key={proveedor.id} label={proveedor.nombre} value={proveedor.id} />
        ))}
      </Picker>
      <Button mode="contained" onPress={handleAgregar} style={styles.buttonSave}>Guardar</Button>
    </View>
  );
}

// Configuración del Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function ProductosScreen() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const agregarProducto = async (nuevoProducto) => {
    await agregarProductoService(
      nuevoProducto.nombre,
      nuevoProducto.descripcion,
      nuevoProducto.categoria_id,
      nuevoProducto.sku,
      nuevoProducto.precio,
      nuevoProducto.stock,
      nuevoProducto.stock_minimo,
      nuevoProducto.proveedor_id,
      nuevoProducto.imagen
    );
    await cargarProductos();
  };

  const cargarProductos = async () => {
    try {
      const datos = await obtenerProductosService();
      setProductos(datos);
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const datos = await obtenerCategoriasService();
      setCategorias(datos);
    } catch (error) {
      console.error("❌ Error al cargar categorías:", error);
    }
  };

  const cargarProveedores = async () => {
    try {
      const datos = await obtenerProveedoresService();
      setProveedores(datos);
    } catch (error) {
      console.error("❌ Error al cargar proveedores:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarProductos();
      cargarCategorias();
      cargarProveedores();
    }, [])
  );

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarProveedores();
  }, []);


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === "Lista" ? "list" : "add";
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Lista">
        {() => (
          <ListaProductosScreen
            productos={productos}
            cargarProductos={cargarProductos}
            categorias={categorias}
            proveedores={proveedores}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Agregar">
        {() => (
          <AgregarProductoScreen
            agregarProducto={agregarProducto}
            categorias={categorias}
            proveedores={proveedores}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: "100%",
  },
  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  buttonSave: {
    backgroundColor: '#6200ea',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonTextSave: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 10,
  },
});