import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import db from '../../db';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';


type Niño = {
  id: string;
  nombre: string;
  apellido: string;
  curso: string;
  presente: boolean;
};


export default function AsistenciaScreen() {
  const [ninos, setNinos] = useState<Niño[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarNinos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ninos'));
        const data = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Niño, 'id'>),
          presente: (d.data() as any).presente === true,
        }));
        setNinos(data);
      } catch (error) {
        console.error('Error al obtener los niños:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarNinos();
  }, []);

  const actualizarPresente = async (id: string, value: boolean) => {
    try {
      await updateDoc(doc(db, 'ninos', id), { presente: value });
      const actualizados = ninos.map((niño) =>
        niño.id === id ? { ...niño, presente: value } : niño
      );
      setNinos(actualizados);
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
    }
  };

  const renderItem = ({ item }: { item: Niño }) => (
    <View style={styles.item}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.curso}>{item.curso}</Text>
      </View>
      <Switch
        value={item.presente}
        onValueChange={(value) => actualizarPresente(item.id, value)}
      />
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ninos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay niños registrados.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: 'bold' },
  curso: { fontSize: 14, color: '#666' },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
