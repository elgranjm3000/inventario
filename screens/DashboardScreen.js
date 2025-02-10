
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import { obtenerVentas, obtenerIngresos,agregarTest,graficaVentas } from '../databaseService';

export default function DashboardScreen() {

   const [ventasData, setVentasData] = useState([]);
   const [ingresosData, setIngresosData] = useState([]);

  useEffect(() => {
    // Cargar datos de ventas e ingresos  

  const obtenerDatos = async () => {
    try {
      const data = await graficaVentas(); // ✅ Esperar la promesa
      setVentasData(data); 
      console.log("📊 Ventas obtenidas:", data);
    } catch (error) {
      console.error("❌ Error obteniendo ventas:", error);
    }
  };

  obtenerDatos();

  }, []);

  const labels = ventasData.map(v => v.fecha);
  const data = ventasData.map(v => v.total);
  return (
    <View style={styles.container}>
    <Text style={styles.title}>Gráfica de Ventas</Text>
    <BarChart
                data={{
                    labels: labels,
                    datasets: [{ data: data }],
                }}
                width={300}
                height={200}
                yAxisLabel="$"
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                }}
            />
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
  },
  title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  chart: {
      borderRadius: 10,
  },
});
