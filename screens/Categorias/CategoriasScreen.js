import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { actualizarCategoria, obtenerCategorias, agregarCategoria as agregarCategoriaService, eliminarCategoria as eliminarCategoriaService } from '../../api/categorias';
import { Card, IconButton } from 'react-native-paper';
import { Button, TextInput, Portal, Modal } from 'react-native-paper';

const ITEMS_POR_PAGINA = 10;

// Pantalla para listar categorías
function ListaCategoriasScreen({ categorias, cargarCategorias }) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');

  useEffect(() => {
    filtrarCategorias();
  }, [busqueda, paginaActual, categorias]);

  const filtrarCategorias = () => {
    let filtradas = categorias;

    // Filtrar por nombre
    if (busqueda.trim() !== "") {
      filtradas = categorias.filter((c) =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Aplicar paginación
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    setCategoriasFiltradas(filtradas.slice(inicio, fin));
  };

  const eliminarCategoria = async (id) => {
    Alert.alert('Confirmar eliminación', '¿Estás seguro de que deseas eliminar esta categoría?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            await eliminarCategoriaService(id);
            await cargarCategorias();
          } catch (error) {
            console.error("❌ Error al eliminar categoría:", error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const abrirModalEdicion = (categoria) => {
    setCategoriaEditando(categoria);
    setNuevoNombre(categoria.nombre);
    setModalVisible(true);
  };

  const guardarEdicion = async () => {
    await actualizarCategoria(categoriaEditando.id, nuevoNombre);
    setModalVisible(false);
    await cargarCategorias();
  };

  return (
    <View style={styles.container}>
      {/* Campo de búsqueda */}
      <TextInput
        mode="outlined"
        label="Buscar categoría..."
        value={busqueda}
        onChangeText={(texto) => setBusqueda(texto)}
        style={styles.input}
        left={<TextInput.Icon icon="magnify" />}
      />

      {/* Lista de categorías */}
      <FlatList
        data={categoriasFiltradas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>{item.nombre}</Text>
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
                onPress={() => eliminarCategoria(item.id)}
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
          disabled={categorias.length <= paginaActual * ITEMS_POR_PAGINA}
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
          <Text style={styles.modalTitle}>Editar Categoría</Text>
          <TextInput
            style={styles.input}
            value={nuevoNombre}
            onChangeText={setNuevoNombre}
            placeholder="Nombre"
          />
          <Button mode="contained" onPress={guardarEdicion} style={styles.saveButton}>Guardar</Button>
        </Modal>
      </Portal>
    </View>
  );
}

// Pantalla para agregar una nueva categoría
function AgregarCategoriaScreen({ agregarCategoria }) {
    const [nombre, setNombre] = useState("");
  
    const handleAgregar = async () => {
      if (nombre.trim() === "") {
        return alert("El nombre es obligatorio");
      }
  
      try {
        const categoria = { nombre };
        await agregarCategoria(categoria);
        alert('Categoría agregada exitosamente');
        setNombre("");
      } catch (error) {
        console.error("❌ Error al guardar categoría:", error);
        alert('Hubo un error al guardar la categoría');
      }
    };
  
    return (
      <View style={styles.container}>
        <TextInput
          placeholder="Nombre de la categoría"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />
        <Button mode="contained" onPress={handleAgregar} style={styles.buttonSave}>Guardar</Button>
      </View>
    );
  }

  // Configuración del Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function CategoriasScreen() {
  const [categorias, setCategorias] = useState([]);

  const agregarCategoria = async (nuevaCategoria) => {
    await agregarCategoriaService(nuevaCategoria.nombre);
    await cargarCategorias();
  };

  const cargarCategorias = async () => {
    try {
      const datos = await obtenerCategorias();
      setCategorias(datos);
    } catch (error) {
      console.error("❌ Error al cargar categorías:", error);
    }
  };

  useEffect(() => {
    cargarCategorias();
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
        {() => <ListaCategoriasScreen categorias={categorias} cargarCategorias={cargarCategorias} />}
      </Tab.Screen>
      <Tab.Screen name="Agregar">
        {() => <AgregarCategoriaScreen agregarCategoria={agregarCategoria} />}
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
    pagination: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 20 },
    pageNumber: { fontSize: 16 },
    button: { marginHorizontal: 10 },
    buttonText: { fontSize: 14 },
    card: { marginBottom: 10 },
    modalContainer: { padding: 20, backgroundColor: "white", margin: 20, borderRadius: 10 },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    saveButton: { marginTop: 10 },
    buttonSave: { marginTop: 10 },
  });