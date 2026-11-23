import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async () => {
    setError('');
    setInfo('');
    if (!empresa.trim()) return setError('Informe o nome da empresa/estabelecimento.');
    if (!email.trim()) return setError('Informe um e-mail.');
    if (password.length < 6) return setError('A senha precisa ter ao menos 6 caracteres.');
    if (password !== confirm) return setError('As senhas não conferem.');

    setBusy(true);
    try {
      const data = await signUp(email, password, empresa);
      if (!data.session) {
        setInfo('Conta criada! Confirme seu e-mail para entrar.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="bodyLarge" style={{ marginBottom: 20, opacity: 0.7 }}>
          Crie sua conta para cadastrar produtos e registrar vendas.
        </Text>
        <TextInput label="Nome da empresa" mode="outlined" value={empresa} onChangeText={setEmpresa}
          autoCapitalize="words" style={styles.input} />
        <TextInput label="E-mail" mode="outlined" value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput label="Senha" mode="outlined" value={password} onChangeText={setPassword}
          secureTextEntry style={styles.input} />
        <TextInput label="Confirmar senha" mode="outlined" value={confirm} onChangeText={setConfirm}
          secureTextEntry style={styles.input} />
        <HelperText type="error" visible={!!error}>{error}</HelperText>
        <HelperText type="info" visible={!!info}>{info}</HelperText>
        <Button mode="contained" onPress={submit} loading={busy} disabled={busy} contentStyle={{ paddingVertical: 6 }}>
          Criar conta
        </Button>
        <Button onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>Voltar para o login</Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  input: { marginBottom: 12 },
});
