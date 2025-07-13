import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Button, TextInput } from 'react-native';
import db from '../../db';
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
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
  const [fecha, setFecha] = useState(new Date());
  const [codigo, setCodigo] = useState('');

  useEffect(() => {
    const cargarNinos = async () => {
      setCargando(true);
      try {
        const fechaStr = fecha.toISOString().split('T')[0];
        const querySnapshot = await getDocs(collection(db, 'ninos'));
        const data: Niño[] = [];
        for (const d of querySnapshot.docs) {
          let presente = false;
          const asis = await getDoc(doc(db, 'asistencias', `${d.id}_${fechaStr}`));
          if (asis.exists()) {
            presente = asis.data().presente === true;
          }
          data.push({ id: d.id, ...(d.data() as Omit<Niño, 'id' | 'presente'>), presente });
        }
        data.sort((a, b) => a.curso.localeCompare(b.curso));
        setNinos(data);
      } catch (error) {
        console.error('Error al obtener los niños:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarNinos();
  }, [fecha]);

  const actualizarPresente = async (id: string, value: boolean) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    try {
      await setDoc(doc(db, 'asistencias', `${id}_${fechaStr}`), {
        ninoId: id,
        fecha: fechaStr,
        presente: value,
      });
      setNinos((prev) => prev.map((n) => n.id === id ? { ...n, presente: value } : n));
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
    }
  };

  const registrarPorCodigo = async () => {
    if (!codigo.trim()) return;
    await actualizarPresente(codigo.trim(), true);
    setCodigo('');
  };

  const renderItem = ({ item }: { item: Niño }) => (
    <View style={styles.item}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.curso}>{item.curso}</Text>
      </View>
      <Button
        title={item.presente ? 'Presente' : 'Marcar'}
        onPress={() => actualizarPresente(item.id, !item.presente)}
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
      <TextInput
        style={styles.input}
        value={fecha.toISOString().split('T')[0]}
        onChangeText={(t) => setFecha(new Date(t))}
      />
      <View style={styles.codigoRow}>
        <TextInput
          placeholder="Código"
          value={codigo}
          onChangeText={setCodigo}
          style={[styles.input, { flex: 1 }]}
        />
        <Button title="Registrar" onPress={registrarPorCodigo} />
      </View>
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  codigoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
});
