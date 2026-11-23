import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, HelperText, IconButton, List, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { listProducts, isLowStock } from '../services/productsService';
import { buildReport } from '../services/reportsService';
import { formatMoney } from '../utils/format';
import { colors } from '../theme';

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { signOut, user, updateCompanyName } = useAuth();
  const empresa = user?.user_metadata?.nome_empresa || '';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nomeEdit, setNomeEdit] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [products, setProducts] = useState([]);
  const [today, setToday] = useState({ faturamento: 0, qtdVendas: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Início',
      headerRight: () => (
        <IconButton
          icon="logout"
          onPress={() =>
            Alert.alert('Sair', 'Deseja sair da sua conta?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: () => signOut() },
            ])
          }
        />
      ),
    });
  }, [navigation, signOut]);

  const openNameDialog = () => {
    setNomeEdit(empresa);
    setNameError('');
    setDialogOpen(true);
  };

  const saveName = async () => {
    if (!nomeEdit.trim()) return setNameError('Informe o nome da empresa.');
    setSavingName(true);
    try {
      await updateCompanyName(nomeEdit);
      setDialogOpen(false);
    } catch (e) {
      setNameError(e.message);
    } finally {
      setSavingName(false);
    }
  };

  const load = async () => {
    try {
      const [prods, rep] = await Promise.all([listProducts(), buildReport('dia')]);
      setProducts(prods);
      setToday(rep);
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <Loading />;

  const low = products.filter(isLowStock);
  const available = products.filter((p) => p.quantidade > 0).length;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <View style={styles.companyRow}>
          <Text
            variant="titleLarge"
            style={[styles.company, !empresa && { opacity: 0.5, fontWeight: '400' }]}
            numberOfLines={1}
            onPress={openNameDialog}
          >
            {empresa || 'Informe o nome da empresa'}
          </Text>
          <IconButton icon="pencil-outline" size={18} onPress={openNameDialog} />
        </View>

        <Card style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.heroLabel}>Vendido hoje</Text>
            <Text variant="displaySmall" style={styles.heroValue}>{formatMoney(today.faturamento)}</Text>
            <Text variant="bodyMedium" style={styles.heroLabel}>
              {today.qtdVendas} {today.qtdVendas === 1 ? 'venda' : 'vendas'}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.row}>
          <Card style={styles.half}>
            <Card.Content>
              <Text variant="headlineSmall">{products.length}</Text>
              <Text variant="bodyMedium">produtos cadastrados</Text>
            </Card.Content>
          </Card>
          <Card style={styles.half}>
            <Card.Content>
              <Text variant="headlineSmall">{available}</Text>
              <Text variant="bodyMedium">com estoque</Text>
            </Card.Content>
          </Card>
        </View>

        <Button mode="contained" icon="cart-plus" onPress={() => navigation.navigate('Vender')}
          style={{ marginTop: 16 }} contentStyle={{ paddingVertical: 6 }}>
          Registrar venda
        </Button>

        <Text variant="titleMedium" style={styles.section}>Alertas de estoque baixo</Text>
        {low.length === 0 ? (
          <Text style={{ opacity: 0.6 }}>Nenhum produto abaixo do estoque mínimo.</Text>
        ) : (
          <Card style={{ backgroundColor: colors.warnBg }}>
            {low.slice(0, 8).map((p) => (
              <List.Item
                key={p.id}
                title={p.nome}
                description={`Restam ${p.quantidade} · mínimo ${p.estoque_minimo}`}
                left={(props) => <List.Icon {...props} icon="alert-outline" color={colors.warn} />}
                onPress={() => navigation.navigate('ProductForm', { product: p })}
              />
            ))}
            {low.length > 8 && (
              <Button onPress={() => navigation.navigate('Produtos', { onlyLow: true })}>
                Ver todos ({low.length})
              </Button>
            )}
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Nome da empresa</Dialog.Title>
          <Dialog.Content>
            <TextInput mode="outlined" label="Nome da empresa" value={nomeEdit}
              onChangeText={setNomeEdit} autoCapitalize="words" autoFocus />
            <HelperText type="error" visible={!!nameError}>{nameError}</HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onPress={saveName} loading={savingName} disabled={savingName}>Salvar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  companyRow: { flexDirection: 'row', alignItems: 'center' },
  company: { fontWeight: '700', flexShrink: 1 },
  hero: { marginTop: 4 },
  heroLabel: { color: '#FFFFFFCC' },
  heroValue: { color: '#FFFFFF', fontWeight: '700', marginVertical: 4 },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  half: { flex: 1 },
  section: { marginTop: 24, marginBottom: 8 },
});
