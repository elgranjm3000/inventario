import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

// Importar pantallas
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClientesScreen from '../screens/Clientes/ClientesScreen';
import CategoriasScreen from '../screens/Categorias/CategoriasScreen';
import ProductosScreen from '../screens/Productos/ProductosScreen';
import ProveedoresScreen from '../screens/ProveedoresScreen';
import VentasScreen from '../screens/VentasScreen';
import LogoutScreen from '../screens/LogoutScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Navegación con menú lateral
function DrawerNavigator() {
  return (
    <Drawer.Navigator 
    screenOptions={{
      drawerStyle: {
        backgroundColor: '#6200ea', // Fondo del menú
        width: 250, // Ancho del Drawer
      },
      drawerActiveTintColor: '#fff', // Color del texto activo
      drawerInactiveTintColor: '#bbb', // Color del texto inactivo
      drawerLabelStyle: {
        fontSize: 16, // Tamaño del texto
        fontWeight: 'bold',
      },
    }}>
     {/* <Drawer.Screen name="Dashboard" component={DashboardScreen}  options={{
        title: 'Dashboard',
        headerStyle: { backgroundColor: '#6200ea' },
     headerTintColor: '#fff'  }} />*/}
      <Drawer.Screen name="Clientes" component={ClientesScreen} options={{
        title: 'Control de Clientes',
        headerStyle: { backgroundColor: '#6200ea' },
        headerTintColor: '#fff'  }} 
      />
      <Drawer.Screen name="Proveedores" component={ProveedoresScreen} options={{
        title: 'Control de proveedores',
        headerStyle: { backgroundColor: '#6200ea' },
        headerTintColor: '#fff'  }} />
      <Drawer.Screen name="Categorias" component={CategoriasScreen} options={{
        title: 'Categorias',
        headerStyle: { backgroundColor: '#6200ea' },
        headerTintColor: '#fff'  }} />
      <Drawer.Screen name="Productos" component={ProductosScreen} options={{
        title: 'Productos',
        headerStyle: { backgroundColor: '#6200ea' },
        headerTintColor: '#fff'  }} />
      <Drawer.Screen name="Ventas" component={VentasScreen} options={{
        title: 'Ventas',
        headerStyle: { backgroundColor: '#6200ea' },
        headerTintColor: '#fff'  }} 
      />
      <Drawer.Screen name="Cerrar Sesión" component={LogoutScreen} />
    </Drawer.Navigator>
  );
}

// Controla si el usuario está autenticado o no
export default function AppNavigator() {
  const { user } = useContext(AuthContext);
  console.log("estado de user: ",user);

  return (
    <NavigationContainer>
      {user ? (
        <DrawerNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
