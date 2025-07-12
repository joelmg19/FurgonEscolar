import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import React from 'react';

// Nuevas pantallas
import Ninos from './ninos';
import Asistencia from './asistencia';
import Pagos from './pagos';

const Drawer = createDrawerNavigator();

export default function DrawerMenu() {
  const colorScheme = useColorScheme();
  const drawerIconColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#6200EE',
        drawerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
        },
        drawerLabelStyle: {
          color: drawerIconColor,
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
        },
        headerTintColor: drawerIconColor,
      }}
    >
      <Drawer.Screen
        name="Ninos"
        component={Ninos}
        options={{
          title: 'Lista de Niños',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Asistencia"
        component={Asistencia}
        options={{
          title: 'Asistencia',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Pagos"
        component={Pagos}
        options={{
          title: 'Pagos del Mes',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
