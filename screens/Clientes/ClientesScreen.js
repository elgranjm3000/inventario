import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { actualizarCliente, obtenerClientes, agregarCliente as agregarClienteService, eliminarCliente as eliminarClienteService } from '../../api/clientes';
import { Card, IconButton } from 'react-native-paper';
import { Button, TextInput, Portal, Modal } from 'react-native-paper';



const ITEMS_POR_PAGINA = 10;

// Pantalla para listar clientes
function ListaClientesScreen({ clientes, cargarClientes }) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');

  useEffect(() => {
    filtrarClientes();
  }, [busqueda, paginaActual, clientes]);

  const filtrarClientes = () => {
    let filtrados = clientes;

    // Filtrar por nombre
    if (busqueda.trim() !== "") {
      filtrados = clientes.filter((c) =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Aplicar paginación
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    setClientesFiltrados(filtrados.slice(inicio, fin));
  };

  const eliminarCliente = async (id) => {
    // Muestra un alerta de confirmación antes de eliminar
    Alert.alert('Confirmar eliminación', '¿Estás seguro de que deseas eliminar este cliente?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            await eliminarClienteService(id);
            await cargarClientes();

          }catch (error) {
            console.error("❌ Error al eliminar cliente:", error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const abrirModalEdicion = (cliente) => {
    setClienteEditando(cliente);
    setNuevoNombre(cliente.nombre);
    setNuevoTelefono(cliente.telefono);
    setNuevoEmail(cliente.email);
    setNuevaDireccion(cliente.direccion);

    setModalVisible(true);
  };

  const guardarEdicion = async () => {
    await actualizarCliente(clienteEditando.id, nuevoNombre, nuevoTelefono, nuevoEmail, nuevaDireccion);
    setModalVisible(false);
    await cargarClientes();
  };

  return (
    <View style={styles.container}>
      {/* Campo de búsqueda */}
      <TextInput
        mode="outlined"
        label="Buscar cliente..."
        value={busqueda}
        onChangeText={(texto) => setBusqueda(texto)}
        style={styles.input}
        left={<TextInput.Icon icon="magnify" />} // Icono de búsqueda
      />

      {/* Lista de clientes */}
      <FlatList
        data={clientesFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>{item.nombre}</Text>
              <Text style={styles.subtitle}>📞 Teléfono: {item.telefono}</Text>
              <Text style={styles.subtitle}>✉️ Email: {item.email}</Text>
              <Text style={styles.subtitle}>🏠 Dirección: {item.direccion}</Text>
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
                onPress={() => eliminarCliente(item.id)} // Llamar a la función de eliminación
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
          disabled={clientes.length <= paginaActual * ITEMS_POR_PAGINA}
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
          <Text style={styles.modalTitle}>Editar Cliente</Text>
          <TextInput
            style={styles.input}
            value={nuevoNombre}
            onChangeText={setNuevoNombre}
            placeholder="Nombre"
          />
          <TextInput
            style={styles.input}
            value={nuevoTelefono}
            onChangeText={setNuevoTelefono}
            placeholder="Teléfono"
          />
          <TextInput
            style={styles.input}
            value={nuevoEmail}
            onChangeText={setNuevoEmail}
            placeholder="Email"
          />
          <TextInput
            style={styles.input}
            value={nuevaDireccion}
            onChangeText={setNuevaDireccion}
            placeholder="Dirección"
          />
          <Button mode="contained" onPress={guardarEdicion} style={styles.saveButton}>Guardar</Button>
        </Modal>
      </Portal>
    </View>
  );
}

// Pantalla para agregar un nuevo cliente
function AgregarClienteScreen({ agregarCliente }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");

  const handleAgregar = async () => {
    if (nombre.trim() === "" || telefono.trim() === "" || email.trim() === "" || direccion.trim() === "") {
      return alert("Todos los campos son obligatorios");
    }

    try {
      // Llamar a agregarCliente y esperar su resultado
      const cliente = { nombre, telefono, email, direccion };
      const result = await agregarCliente(cliente);
      alert('Cliente agregado exitosamente');
      
      // Limpiar los campos del formulario
      setNombre("");
      setTelefono("");
      setEmail("");
      setDireccion("");
    } catch (error) {
      console.error("❌ Error para guardar cliente", error);
      alert('Hubo un error al guardar el cliente');
    }
    setNombre("");
    setTelefono("");
    setEmail("");
    setDireccion("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre del cliente"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Teléfono del cliente"
        value={telefono}
        onChangeText={setTelefono}
        style={styles.input}
      />
      <TextInput
        placeholder="Email del cliente"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Dirección del cliente"
        value={direccion}
        onChangeText={setDireccion}
        style={styles.input}
      />
      <Button mode="contained" class={styles.buttonSave} labelStyle={styles.buttonTextSave}  onPress={handleAgregar} >Guardar</Button>
    </View>
  );
}

// Configuración del Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function ClientesScreen() {
  const [clientes, setClientes] = useState([]);

  const agregarCliente = async (nuevoCliente) => {
    const clienteGuardado = await agregarClienteService(nuevoCliente.nombre, nuevoCliente.telefono, nuevoCliente.email, nuevoCliente.direccion);
    await cargarClientes(); // Llamamos la función para actualizar la lista
  };

  const cargarClientes = async () => {
    try {
      const datos = await obtenerClientes(); // Obtener clientes desde API
      console.log("datos", datos);
      setClientes(datos); // Guardar en el estado
    } catch (error) {
      console.error("❌ Error al cargar clientes", error);
    }
  };

  useEffect(() => {
    cargarClientes(); // Llamar la función al montar el componente
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
        {() => <ListaClientesScreen clientes={clientes} cargarClientes={cargarClientes} />}
      </Tab.Screen>
      <Tab.Screen name="Agregar">
        {() => <AgregarClienteScreen agregarCliente={agregarCliente} />}
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
    paddingLeft: 8,
    marginBottom: 10,
    width: "100%",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  subtitle: { fontSize: 14 },
  pagination: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 20 },
  pageNumber: { fontSize: 16 },
  button: { marginHorizontal: 10 },
  buttonText: { fontSize: 14 },
  card: { marginBottom: 10 },
  modalContainer: { padding: 20, backgroundColor: "white", margin: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  saveButton: { marginTop: 10 },
});
