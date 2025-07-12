import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import db from '../../db';
import {
  collection,
  getDocs,
  addDoc,
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
  const [modalVisible, setModalVisible] = useState(false);
  const [monto, setMonto] = useState('');
  const [mes, setMes] = useState('');
  const [actual, setActual] = useState<Niño | null>(null);

  useEffect(() => {
    obtenerNinos();
  }, []);

  const obtenerNinos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'ninos'));
      const datos = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Niño, 'id' | 'pago'>),
        pago: false,
      }));
      datos.sort((a, b) => a.curso.localeCompare(b.curso));
      setNinos(datos);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const registrarPago = async () => {
    if (!actual) return;
    try {
      await addDoc(collection(db, 'pagos'), {
        ninoId: actual.id,
        mes,
        monto: parseFloat(monto),
      });
      setModalVisible(false);
      setMonto('');
      setMes('');
      setActual(null);
      Alert.alert('Pago registrado');
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      Alert.alert('Error', 'No se pudo registrar el pago');
    }
  };

  const renderItem = ({ item }: { item: Niño }) => (
    <View style={styles.item}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.curso}>{item.curso}</Text>
      </View>
      <Button title="Registrar" onPress={() => {setActual(item); setModalVisible(true);}} />
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
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar Pago</Text>
            <TextInput
              placeholder="Mes (YYYY-MM)"
              value={mes}
              onChangeText={setMes}
              style={styles.input}
            />
            <TextInput
              placeholder="Monto"
              keyboardType="numeric"
              value={monto}
              onChangeText={setMonto}
              style={styles.input}
            />
            <Button title="Guardar" onPress={registrarPago} />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
});
