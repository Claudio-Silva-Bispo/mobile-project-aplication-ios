import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../src/firebaseConfig";
import CustomButton from "../components/CustomButton";
import Footer from "../components/Footer";
import { getAuth } from "firebase/auth";

const ConsultarDadosClienteScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const user = auth.currentUser;
  if (!user) {
    Alert.alert("Erro", "Nenhum usuário autenticado!");
    navigation.goBack();
    return null;
  }

  const [step, setStep] = useState(1);
  const [dados, setDados] = useState<any>({});
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enderecoResidencia, setEnderecoResidencia] = useState<any>({});
  const [enderecoConsulta, setEnderecoConsulta] = useState<any>({});


  useEffect(() => {
    const buscarDados = async () => {
      try {
        const dadosCadastraisRef = doc(db, "t_dados_cadastrais", user.uid);
        const enderecoResidenciaRef = doc(db, "t_endereco_residencia", user.uid);
        const enderecoConsultaRef = doc(db, "t_endereco_preferencia", user.uid);
        const diasPreferenciaRef = doc(db, "t_dias_preferencia", user.uid);
        const turnoPreferenciaRef = doc(db, "t_turno_preferencia", user.uid);
  
        const dadosCadastraisSnap = await getDoc(dadosCadastraisRef);
        const enderecoResidenciaSnap = await getDoc(enderecoResidenciaRef);
        const enderecoConsultaSnap = await getDoc(enderecoConsultaRef);
        const diasPreferenciaSnap = await getDoc(diasPreferenciaRef);
        const turnoPreferenciaSnap = await getDoc(turnoPreferenciaRef);
  
        setDados((prevDados: any) => ({
          ...prevDados, // Mantém os dados existentes
          ...(dadosCadastraisSnap.exists() ? dadosCadastraisSnap.data() : {}),
          ...(enderecoResidenciaSnap.exists() ? enderecoResidenciaSnap.data() : {}),
          ...(enderecoConsultaSnap.exists() ? enderecoConsultaSnap.data() : {}),
          ...(diasPreferenciaSnap.exists() ? diasPreferenciaSnap.data() : {}),
          ...(turnoPreferenciaSnap.exists() ? turnoPreferenciaSnap.data() : {}),
          idCliente: user.uid,
        }));
  
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        Alert.alert("Erro", "Não foi possível buscar os dados.");
      } finally {
        setLoading(false);
      }
    };
  
    buscarDados();
  }, []);
  


  const atualizarDados = async (colecao: string, novosDados: object) => {
    try {

      const auth = getAuth();
      const IdCliente = auth.currentUser?.uid;

      if (!IdCliente) {
        Alert.alert("Erro", "ID do cliente não encontrado.");
        return;
      }
      
      const dadosComIdCliente = { ...novosDados, idCliente: IdCliente };
      const docRef = doc(db, colecao, IdCliente);
      
      //await updateDoc(docRef, novosDados);
      await updateDoc(docRef, dadosComIdCliente);
      await updateDoc(doc(db, "t_endereco_residencia", user.uid), enderecoResidencia);
      await updateDoc(doc(db, "t_endereco_preferencia", user.uid), enderecoConsulta);

      setMensagem("✅ Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      setMensagem("❌ Erro ao atualizar os dados.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meus Dados</Text>

      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <>
          {step === 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados pessoais</Text>
              <TextInput style={styles.input} placeholder="Nome" value={dados.nome || ""} onChangeText={(text) => setDados({ ...dados, nome: text })} />
              <TextInput style={styles.input} placeholder="Sobrenome" value={dados.sobrenome || ""} onChangeText={(text) => setDados({ ...dados, sobrenome: text })} />
              <TextInput style={styles.input} placeholder="CPF" value={dados.cpf || ""} onChangeText={(text) => setDados({ ...dados, cpf: text })}/>
              <TextInput style={styles.input} placeholder="Data de Nascimento" value={dados.dataNascimento || ""} onChangeText={(text) => setDados({ ...dados, dataNascimento: text })} />
              <TextInput style={styles.input} placeholder="Idade" keyboardType="numeric" value={dados.idade || ""} onChangeText={(text) => setDados({ ...dados, idade: text })} />
              <TextInput style={styles.input} placeholder="Altura (m)" keyboardType="decimal-pad" value={dados.altura || ""} onChangeText={(text) => setDados({ ...dados, altura: text })} />

              <CustomButton title="Atualizar" textColor="#fff" onPress={() => atualizarDados("t_dados_cadastrais_cliente", dados)} width={'100%'}/>
              
              <TouchableOpacity onPress={() => setStep(2)} style={styles.nextButton}>
                <Text style={styles.buttonText}>→ Próximo</Text>
              </TouchableOpacity>

            </View>
          )}

          {step === 2 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Endereço de residência</Text>
              
              <TextInput style={styles.input} placeholder="CEP" 
              value={enderecoResidencia.cepResidencia || ""} 
              onChangeText={(text) => setDados({ ...enderecoResidencia, cepResidencia: text })} />
              
              <TextInput style={styles.input} placeholder="Estado" 
              value={enderecoResidencia.estadoResidencia || ""} 
              onChangeText={(text) => setDados({ ...enderecoResidencia, estadoResidencia: text })} />
              
              <TextInput style={styles.input} placeholder="Cidade" 
              value={enderecoResidencia.cidadeResidencia || ""} 
              onChangeText={(text) => setDados({ ...enderecoResidencia, cidadeResidencia: text })} />
              
              <TextInput style={styles.input} placeholder="Rua" 
              value={enderecoResidencia.ruaResidencia || ""} 
              onChangeText={(text) => setDados({ ...enderecoResidencia, ruaResidencia: text })} />
              
              <TextInput style={styles.input} placeholder="Número" 
              value={enderecoResidencia.numeroResidencia || ""} 
              onChangeText={(text) => setDados({ ...enderecoResidencia, numeroResidencia: text })} />

              <CustomButton title="Atualizar" textColor="#fff" onPress={() => atualizarDados("t_endereco_residencia", enderecoResidencia)} width={'100%'}/>
              
              <TouchableOpacity onPress={() => setStep(1)} style={styles.prevButton}>
                <Text style={styles.buttonText}>← Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep(3)} style={styles.nextButton}>
                <Text style={styles.buttonText}>→ Próximo</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Endereço de preferência para consulta</Text>
              
              <TextInput style={styles.input} placeholder="CEP" value={enderecoConsulta.cep || ""} onChangeText={(text) => setDados({ ...enderecoConsulta, cepConsultaCliente: text })} />
              
              <TextInput style={styles.input} placeholder="Estado" 
              value={enderecoResidencia.estadoConsultaCliente || ""} 
              onChangeText={(text) => setDados({ ...enderecoConsulta, estadoConsultaCliente: text })} />
              
              <TextInput style={styles.input} placeholder="Cidade" 
              value={enderecoResidencia.cidadeConsultaCliente || ""} onChangeText={(text) => setDados({ ...enderecoConsulta, cidadeConsultaCliente: text })} />
              
              <TextInput style={styles.input} placeholder="Rua" 
              value={enderecoResidencia.ruaConsultaCliente || ""} 
              onChangeText={(text) => setDados({ ...enderecoConsulta, ruaConsultaCliente: text })} />
              
              <TextInput style={styles.input} placeholder="Número" 
              value={enderecoResidencia.numeroConsultaCliente || ""} 
              onChangeText={(text) => setDados({ ...enderecoConsulta, numeroConsultaCliente: text })} />
              
              <CustomButton title="Atualizar" textColor="#fff" onPress={() => atualizarDados("t_endereco_preferencia", enderecoConsulta)} width={'100%'}/>
              
              <TouchableOpacity onPress={() => setStep(2)} style={styles.prevButton}>
                <Text style={styles.buttonText}>← Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep(4)} style={styles.nextButton}>
                <Text style={styles.buttonText}>→ Próximo</Text>
              </TouchableOpacity>

            </View>
          )}

          {step === 4 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dia de preferência</Text>
              <TextInput style={styles.input} placeholder="Dias da Semana" value={dados.diasSemanaCliente || ""} onChangeText={(text) => setDados({ ...dados, diasSemanaCliente: text })} />
              
              <CustomButton title="Atualizar" textColor="#fff" onPress={() => atualizarDados("t_dias_preferencia", dados)} width={'100%'}/>
              
              <TouchableOpacity onPress={() => setStep(3)} style={styles.prevButton}>
                <Text style={styles.buttonText}>← Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep(5)} style={styles.nextButton}>
                <Text style={styles.buttonText}>→ Próximo</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 5 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Turno de preferência</Text>
              <TextInput style={styles.input} placeholder="Turno" value={dados.turnoCliente || ""} onChangeText={(text) => setDados({ ...dados, turnoCliente: text })} />

              <CustomButton title="Atualizar" textColor="#fff" onPress={() => atualizarDados("t_turno_preferencia", dados)} width={'100%'}/>
              
              <TouchableOpacity onPress={() => setStep(4)} style={styles.prevButton}>
                <Text style={styles.buttonText}>← Voltar</Text>
              </TouchableOpacity>
            </View>
            
          )}

          {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}
        </>
        
      )}

      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
    width:'100%',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
  mensagem: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  prevButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ff5d4b",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  nextButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#2196F3",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#08c8f8",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  
});


export default ConsultarDadosClienteScreen;
