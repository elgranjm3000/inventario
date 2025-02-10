import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

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
function NuevaVentaScreen({ agregarVenta }) {
  const [cliente, setCliente] = useState('');
  const [productos, setProductos] = useState([]);
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');

  const agregarProducto = () => {
    if (producto && cantidad && precio) {
      const total = parseFloat(cantidad) * parseFloat(precio);
      setProductos([...productos, { producto, cantidad: parseInt(cantidad), precio: parseFloat(precio), total }]);
      setProducto('');
      setCantidad('');
      setPrecio('');
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
      setCliente('');
      setProductos([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Venta</Text>
      <TextInput style={styles.input} placeholder="Cliente" value={cliente} onChangeText={setCliente} />
      <Text style={styles.subtitle}>Agregar Producto</Text>
      <TextInput style={styles.input} placeholder="Producto" value={producto} onChangeText={setProducto} />
      <TextInput style={styles.input} placeholder="Cantidad" keyboardType="numeric" value={cantidad} onChangeText={setCantidad} />
      <TextInput style={styles.input} placeholder="Precio Unitario" keyboardType="numeric" value={precio} onChangeText={setPrecio} />
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

  const agregarVenta = (nuevaVenta) => {
    setVentas([...ventas, nuevaVenta]);
  };

  return (
      <Tab.Navigator>
        <Tab.Screen name="Lista de Ventas">
          {() => <ListaVentasScreen ventas={ventas} />}
        </Tab.Screen>
        <Tab.Screen name="Nueva Venta">
          {() => <NuevaVentaScreen agregarVenta={agregarVenta} />}
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
});

