import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet,TouchableOpacity,Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { actualizarProveedor, obtenerProveedores, agregarProveedor as agregarProveedorService, eliminarProveedor as eliminarProveedorService } from '../databaseService';
import { Card, IconButton  } from 'react-native-paper';
import { Button,TextInput,Portal,Modal } from 'react-native-paper';




const ITEMS_POR_PAGINA = 10;

// Pantalla para listar proveedores
function ListaProveedoresScreen({ proveedores, cargarProveedores }) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoContacto, setNuevoContacto] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');

  useEffect(() => {
    filtrarProveedores();
  }, [busqueda, paginaActual, proveedores]);

  const filtrarProveedores = () => {
    let filtrados = proveedores;

    // Filtrar por nombre
    if (busqueda.trim() !== "") {
      filtrados = proveedores.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Aplicar paginación
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    setProveedoresFiltrados(filtrados.slice(inicio, fin));
  };

  const eliminarProveedor = (id) => {
    // Muestra un alerta de confirmación antes de eliminar
    Alert.alert('Confirmar eliminación', '¿Estás seguro de que deseas eliminar este proveedor?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        onPress: () => {
          eliminarProveedorService(id, (deletedId) => {
            setProveedoresFiltrados(prevData => prevData.filter(item => item.id !== deletedId)); // Actualizamos la lista
          }).then(() => console.log("Proveedor eliminado exitosamente"))
          .catch(error => console.error("❌ Error:", error));
          console.log(id)
        },
        style: 'destructive',
      },
    ]);
  };

  const abrirModalEdicion = (proveedor) => {
    setProveedorEditando(proveedor);
    setNuevoNombre(proveedor.nombre);
    setNuevoContacto(proveedor.contacto);
    setNuevoTelefono(proveedor.telefono);

    setModalVisible(true);
  };

  const guardarEdicion = async () => {
    await actualizarProveedor(proveedorEditando.id, nuevoNombre,nuevoContacto,nuevoTelefono);
    setModalVisible(false);
    cargarProveedores();
  };

  return (
    <View style={styles.container}>
      {/* Campo de búsqueda */}
      <TextInput
  mode="outlined"
  label="Buscar proveedor..."
  value={busqueda}
  onChangeText={(texto) => setBusqueda(texto)}
  style={styles.input}
  left={<TextInput.Icon icon="magnify" />} // Icono de búsqueda
/>

      {/* Lista de proveedores */}
      <FlatList
      data={proveedoresFiltrados}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>{item.nombre}</Text>
            <Text style={styles.subtitle}>📍 Ubicación: {item.contacto}</Text>
            <Text style={styles.subtitle}>📞 Contacto: {item.telefono}</Text>
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
              onPress={() => eliminarProveedor(item.id)} // Llamar a la función de eliminación
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
            disabled={proveedores.length <= paginaActual * ITEMS_POR_PAGINA}
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
          <Text style={styles.modalTitle}>Editar Proveedor</Text>
          <TextInput
            style={styles.input}
            value={nuevoNombre}
            onChangeText={setNuevoNombre}
            placeholder="Nombre"
          />
          <TextInput
            style={styles.input}
            value={nuevoContacto}
            onChangeText={setNuevoContacto}
            placeholder="Contacto"
          />
          <TextInput
            style={styles.input}
            value={nuevoTelefono}
            onChangeText={setNuevoTelefono}
            placeholder="Telefono"
          />
          <Button mode="contained" onPress={guardarEdicion} style={styles.saveButton}>Guardar</Button>
        </Modal>
      </Portal>
    
    </View>



  );
}

// Pantalla para agregar un nuevo proveedor
function AgregarProveedorScreen({ agregarProveedor }) {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [telefono, setTelefono] = useState("");

  const handleAgregar = async () => {
    if (nombre.trim() === "" || contacto.trim() === "" || telefono.trim() === "") {
      return alert("Todos los campos son obligatorios");
    }

    try {
      // Llamar a agregarProveedor y esperar su resultado
      const proveedor = { nombre, contacto, telefono };
      const result = await agregarProveedor(proveedor);
      alert('Proveedor agregado exitosamente');
      
      // Limpiar los campos del formulario
      setNombre("");
      setContacto("");
      setTelefono("");
    } catch (error) {
      console.error("❌ Error para guardar proveedores", error);
      alert('Hubo un error al guardar el proveedor');
    }
    setNombre("");
    setContacto("");
    setTelefono("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre del proveedor"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Contacto del proveedor"
        value={contacto}
        onChangeText={setContacto}
        style={styles.input}
      />
      <TextInput
        placeholder="Telefono del proveedor"
        value={telefono}
        onChangeText={setTelefono}
        style={styles.input}
      />
      <Button mode="contained" class={styles.buttonSave} labelStyle={styles.buttonTextSave}  onPress={handleAgregar} >Guardar</Button>
    </View>
  );
}

// Configuración del Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function ProveedoresScreen() {
  const [proveedores, setProveedores] = useState([]);

  const agregarProveedor = async (nuevoProveedor) => {

    const proveedorGuardado = await agregarProveedorService(nuevoProveedor.nombre,nuevoProveedor.contacto,nuevoProveedor.telefono);

    await cargarProveedores(); // Llamamos la función para actualizar la lista

  };

  const cargarProveedores = async () => {
    try {
      const datos = await obtenerProveedores(); // Obtener proveedores desde SQLite
      console.log("datos",datos);
      setProveedores(datos); // Guardar en el estado
    } catch (error) {
      console.error("❌ Error al cargar proveedores", error);
    }
  };


  useEffect(() => {
    
    cargarProveedores(); // Llamar la función al montar el componente
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
          {() => <ListaProveedoresScreen proveedores={proveedores} cargarProveedores={cargarProveedores} />}
        </Tab.Screen>
        <Tab.Screen name="Agregar">
          {() => <AgregarProveedorScreen agregarProveedor={agregarProveedor} />}
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
    width:300
  },
  listItem: { fontSize: 16, padding: 5 },
  
  disabledButton: { backgroundColor: "#ccc" },
  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 5,
    borderRadius: 10,
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width:'300'
    
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
    borderRadius: 10,  // Bordes redondeados
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
    backgroundColor: '#6200ea', // Color principal
    borderRadius: 8, // Bordes redondeados
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonTextSave: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // Texto blanco
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
});
