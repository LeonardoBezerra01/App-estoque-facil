import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e.message?.includes('Invalid login') ? 'E-mail ou senha incorretos.' : e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="headlineLarge" style={styles.brand}>Estoque Fácil</Text>
          <Text variant="bodyLarge" style={styles.sub}>Controle seu estoque e suas vendas em um só lugar.</Text>

          <TextInput
            label="E-mail"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            style={styles.input}
          />
          <TextInput
            label="Senha"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            right={<TextInput.Icon icon={showPass ? 'eye-off' : 'eye'} onPress={() => setShowPass(!showPass)} />}
            style={styles.input}
          />
          <HelperText type="error" visible={!!error}>{error}</HelperText>

          <Button mode="contained" onPress={submit} loading={busy} disabled={busy} contentStyle={styles.btn}>
            Entrar
          </Button>
          <View style={styles.row}>
            <Text>Ainda não tem conta?</Text>
            <Button onPress={() => navigation.navigate('Register')}>Criar conta</Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { fontWeight: '700', color: '#0F6B5C' },
  sub: { marginTop: 6, marginBottom: 28, opacity: 0.7 },
  input: { marginBottom: 12 },
  btn: { paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
});
