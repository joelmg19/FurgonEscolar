import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import db from '../../db';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';

type Niño = {
  id: string;
  nombre: string;
  apellido: string;
  curso: string;
  pago: boolean;
};

export default function PagosScreen() {
  const [ninos, setNinos] = useState<Niño[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerNinos();
  }, []);

  const obtenerNinos = async () => {
    try {
      const q = query(collection(db, 'ninos'), orderBy('apellido'));
      const querySnapshot = await getDocs(q);
      const datos = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Niño, 'id' | 'pago'>),
        pago: (d.data() as any).pagado === true,
      }));
      setNinos(datos);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const actualizarPago = async (id: string, valor: boolean) => {
    try {
      await updateDoc(doc(db, 'ninos', id), { pagado: valor });
      setNinos((prev) =>
        prev.map((nino) =>
          nino.id === id ? { ...nino, pago: valor } : nino
        )
      );
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado de pago.');
    }
  };

  const renderItem = ({ item }: { item: Niño }) => (
    <View style={styles.item}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.curso}>{item.curso}</Text>
      </View>
      <Switch
        value={item.pago}
        onValueChange={(value) => actualizarPago(item.id, value)}
      />
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ninos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay niños registrados.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
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
