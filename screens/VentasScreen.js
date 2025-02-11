import React, { useState, useEffect,useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { obtenerClientes,obtenerClientePorId } from '../api/clientes';
import { obtenerProductos,obtenerProductoPorId} from '../api/productos';

import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from "react-native-dropdown-picker";


// 📌 Pantalla para ver la lista de ventas registradas
function ListaVentasScreen({ ventas }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Ventas</Text>
      <FlatList
        data={ventas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.ventaItem}>
            <Text>Cliente: {item.cliente}</Text>
            <Text>Fecha: {item.fecha}</Text>
            <Text>Total: ${item.total.toFixed(2)}</Text>
            <Text>Productos:</Text>
            {item.detalles.map((detalle, i) => (
              <Text key={i}>- {detalle.producto} ({detalle.cantidad}) - ${detalle.total.toFixed(2)}</Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}

// 📌 Pantalla para agregar una nueva venta
function NuevaVentaScreen({ agregarVenta,clientes,addproductos }) {
  console.log("clientes: ",clientes);
  const [cliente, setCliente] = useState([]);
  const [productos, setProductos] = useState([]);
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  
  const [openClientes, setOpenClientes] = useState(false);
  const [valueClientes, setValueClientes] = useState(null);
  const [openProductos, setOpenProductos] = useState(false);
  const [valueProductos, setValueProductos] = useState(null);

  const [nombreCliente , setNombreCliente]= useState(''); 
  const [telefonoCliente , setTelefonoCliente]= useState(''); 
  const [stockProducto , setStockProductos]= useState(''); 


  const [itemsClientes, setItemsClientes] = useState(
    clientes.map((cliente) => ({
      label: cliente.nombre,
      value: cliente.id,
    }))
  );

  const [itemsProductos, setItemsProductos] = useState(
    addproductos.map((addproductos) => ({
      label: addproductos.nombre,
      value: addproductos.id,
    }))
  );

  const agregarProducto = () => {
    if (producto && cantidad && precio) {
      const total = parseFloat(cantidad) * parseFloat(precio);
      setProductos([...productos, { producto, cantidad: parseInt(cantidad), precio: parseFloat(precio), total }]);
      setProducto('');
      setCantidad('');
      setPrecio('');
      setNombreCliente('');
      setTelefonoCliente('');
      setStockProductos('');
    }
  };

  const finalizarVenta = () => {
    if (cliente && productos.length > 0) {
      const totalVenta = productos.reduce((sum, item) => sum + item.total, 0);
      const nuevaVenta = {
        cliente,
        fecha: new Date().toLocaleDateString(),
        detalles: productos,
        total: totalVenta,
      };
      agregarVenta(nuevaVenta);
      setCliente(null);
      setProductos([]);
      setCantidad('');
      setPrecio('');
      setNombreCliente('');
      setTelefonoCliente('');
      setStockProductos('');
    }
  };

  const cargarClientesId = async (id) => {
    try {
      const datos = await obtenerClientePorId(id);
      setNombreCliente(datos.nombre);
      setTelefonoCliente(datos.telefono);
      console.log("cliente obtenido por seleccion ",datos);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
    }
  };

  const cargarProductosId = async (id) => {
    try {
      const datosProductos = await obtenerProductoPorId(id);
      setStockProductos(datosProductos.stock);
      setPrecio(datosProductos.precio);
      console.log("productos obtenido por seleccion ",datosProductos);
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Venta</Text>  
      <DropDownPicker
        open={openClientes}
        value={valueClientes}
        items={itemsClientes}
        setOpen={setOpenClientes}
        setValue={setValueClientes}
        setItems={setItemsClientes}
        placeholder="Seleccione un cliente"
        searchable={true}  
        searchPlaceholder="Buscar cliente..."
        onChangeValue={(itemValue) => {
          setCliente(itemValue);
          if (itemValue) {
            cargarClientesId(itemValue);
          }
        }}
        style={[styles.dropdown, { zIndex: openClientes ? 1000 : 1 }]}
        dropDownContainerStyle={[styles.dropdownContainer, { zIndex: 1000 }]}
      />
     
      {nombreCliente && <Text style={styles.subtitle}>Nombre: {nombreCliente}</Text>}
      {telefonoCliente && <Text style={styles.subtitle}>Telefono: {telefonoCliente}</Text>}
  
      <Text style={styles.subtitle}>Agregar Producto</Text>
      <DropDownPicker
        open={openProductos}
        value={valueProductos}
        items={itemsProductos}
        setOpen={setOpenProductos}
        setValue={setValueProductos}
        setItems={setItemsProductos}
        placeholder="Seleccione un producto"
        searchable={true}  
        searchPlaceholder="Buscar producto..."
        onChangeValue={(itemValue) => {
          setProducto(itemValue);
          if (itemValue) {
            cargarProductosId(itemValue);
          }
        }}
        style={[styles.dropdown, { zIndex: openProductos ? 1000 : 1 }]}
        dropDownContainerStyle={[styles.dropdownContainer, { zIndex: 1000 }]}
      />
      {stockProducto && <Text style={styles.subtitle}>Stock actual: {stockProducto}</Text>}
      <TextInput style={styles.input} placeholder="Cantidad" keyboardType="numeric" value={cantidad} onChangeText={setCantidad} />
      <TextInput style={styles.input} placeholder="Precio Unitario" keyboardType="numeric" value={precio.toString()} onChangeText={setPrecio} />
      <Button title="Agregar Producto" onPress={agregarProducto} />
      
      {/* Lista de productos agregados a la venta */}
      <FlatList
        data={productos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text>- {item.producto} ({item.cantidad}) - ${item.total.toFixed(2)}</Text>
        )}
      />

      <Button title="Finalizar Venta" onPress={finalizarVenta} disabled={productos.length === 0} />
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function VentasScreen() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);


  const agregarVenta = (nuevaVenta) => {
    setVentas([...ventas, nuevaVenta]);
  };

  const cargarClientes = async () => {
    try {
      const datos = await obtenerClientes();
      setClientes(datos);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
    }
  };
  const cargarProductos = async () => {
    try {
      const datosProductos = await obtenerProductos();
      setProductos(datosProductos);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarClientes();
      cargarProductos();
    }, [])
  );


  return (
      <Tab.Navigator>
        <Tab.Screen name="Lista de Ventas">
          {() => <ListaVentasScreen ventas={ventas} />}
        </Tab.Screen>
        <Tab.Screen name="Nueva Venta">
          {() => <NuevaVentaScreen agregarVenta={agregarVenta} clientes={clientes} addproductos={productos} />}
        </Tab.Screen>
      </Tab.Navigator>
    
  );
}

// 📌 Estilos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  ventaItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', marginBottom: 10 },  
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
  },
});

