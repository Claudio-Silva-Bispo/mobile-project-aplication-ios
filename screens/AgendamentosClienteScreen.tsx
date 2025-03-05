import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { db, auth } from '../src/firebaseConfig'; // Importe o Firestore e o auth
import { doc, getDoc } from 'firebase/firestore';
import CustomButton from '../components/CustomButton';
import { Linking } from 'react-native';

interface Agendamento {
  data: string;
  turno: string;
  nomeClinica: string;
  enderecoCliente: string;
  latitude: number;
  longitude: number;
}

const AgendamentosClienteScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  // Função para recuperar os agendamentos do cliente logado
  const fetchAgendamentos = async () => {
    try {
      const clienteId = auth.currentUser?.uid; // Pegando o ID do cliente logado

      if (!clienteId) {
        Alert.alert('Erro', 'Você precisa estar logado para ver seus agendamentos.');
        return;
      }

      const docRef = doc(db, 't_sugestao_consulta_cliente', clienteId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const agendamentosData = docSnap.data().agendamentos; // Exemplo de como os dados podem estar estruturados
        setAgendamentos(agendamentosData);
      } else {
        Alert.alert('Erro', 'Nenhum agendamento encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      Alert.alert('Erro', 'Falha ao carregar os agendamentos.');
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const openMap = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meus Agendamentos</Text>
      {agendamentos.length === 0 ? (
        <Text style={styles.noAppointments}>Você não tem agendamentos.</Text>
      ) : (
        agendamentos.map((agendamento, index) => (
          <View style={styles.card} key={index}>
            <Text style={styles.cardTitle}>{agendamento.nomeClinica}</Text>
            <Text style={styles.cardText}>Data: {agendamento.data}</Text>
            <Text style={styles.cardText}>Turno: {agendamento.turno}</Text>
            
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => openMap(agendamento.latitude, agendamento.longitude)}
            >
              <Text style={styles.locationButtonText}>Ver localização</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <CustomButton
        title="Voltar"
        onPress={() => navigation.goBack()}
        width="100%"
        textColor="#fff"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#024059',
    marginBottom: 20,
  },
  noAppointments: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A4275',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#555',
  },
  locationButton: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#08c8f8',
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AgendamentosClienteScreen;
