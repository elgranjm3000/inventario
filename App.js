import { StatusBar } from 'expo-status-bar';
import React, { useState,useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import db, { setupDatabase } from './database';  // Asegúrate de importar bien
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';


console.log("listo bro");
export default function App() {
  useEffect(() => {
    console.log("inicializando");
    setupDatabase(); // Inicializar la base de datos
  }, []);

  return (
    <PaperProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
     </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
