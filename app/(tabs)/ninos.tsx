import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import db from '../../db';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

type Niño = {
  id: string;
  nombre: string;
  apellido: string;
  curso: string;
  qrId?: string;
};

const cursosDisponibles = [
  'Prekínder', 'Kínder',
  '1° Básico', '2° Básico', '3° Básico',
  '4° Básico', '5° Básico', '6° Básico',
  '7° Básico', '8° Básico',
];

export default function NinosScreen() {
  const [ninos, setNinos] = useState<Niño[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [curso, setCurso] = useState(cursosDisponibles[0]);

  useEffect(() => {
    obtenerNinos();
  }, []);

  const obtenerNinos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'ninos'));
      const data = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Niño, 'id'>),
      }));
      data.sort((a, b) => a.curso.localeCompare(b.curso));
      setNinos(data);
    } catch (error) {
      console.error('Error al obtener niños:', error);
    }
  };

  const agregarNino = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Error', 'Debes completar todos los campos.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'ninos'), {
        nombre,
        apellido,
        curso,
        colegio: 'Sochides',
        presente: false,
        pagado: false,
      });
      await updateDoc(docRef, { qrId: docRef.id });

      setNombre('');
      setApellido('');
      setCurso(cursosDisponibles[0]);
      setModalVisible(false);
      obtenerNinos();
    } catch (error) {
      console.error('Error al agregar niño:', error);
    }
  };

  const renderItem = ({ item }: { item: Niño }) => (
    <View style={styles.item}>
      <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
      <Text style={styles.curso}>{item.curso}</Text>
      <Text style={styles.codigo}>Código: {item.qrId || item.id}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={ninos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay niños registrados.</Text>}
      />

      <TouchableOpacity style={styles.botonAgregar} onPress={() => setModalVisible(true)}>
        <Text style={styles.botonTexto}>+ Agregar Niño</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.tituloModal}>Agregar Niño</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            value={apellido}
            onChangeText={setApellido}
          />
          <Text style={styles.label}>Curso</Text>
          <Picker
            selectedValue={curso}
            onValueChange={(itemValue) => setCurso(itemValue)}
            style={styles.picker}
          >
            {cursosDisponibles.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>

          <View style={styles.botonesModal}>
            <Button title="Agregar" onPress={agregarNino} />
            <Button title="Cancelar" color="gray" onPress={() => setModalVisible(false)} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  nombre: { fontSize: 16, fontWeight: 'bold' },
  curso: { fontSize: 14, color: '#666' },
  codigo: { fontSize: 12, color: '#333' },
  empty: { textAlign: 'center', marginTop: 20, color: '#999' },
  botonAgregar: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#6200ee',
    padding: 14,
    borderRadius: 24,
  },
  botonTexto: { color: 'white', fontWeight: 'bold' },
  modalContainer: {
    padding: 20,
    gap: 12,
  },
  tituloModal: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  picker: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 16,
  },
  botonesModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});
