import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Divider, IconButton, List, Searchbar, Snackbar, Surface, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { listProducts } from '../services/productsService';
import { registerSale } from '../services/salesService';
import { formatMoney } from '../utils/format';

export default function NewSaleScreen({ navigation }) {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({}); // { [produtoId]: quantidade }
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = async () => {
    try {
      setProducts(await listProducts());
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const change = (p, delta) => {
    setCart((c) => {
      const next = (c[p.id] || 0) + delta;
      if (next > p.quantidade) {
        setToast(`Só há ${p.quantidade} un. de "${p.nome}" em estoque.`);
        return c;
      }
      const copy = { ...c };
      if (next <= 0) delete copy[p.id];
      else copy[p.id] = next;
      return copy;
    });
  };

  const items = useMemo(
    () => products.filter((p) => cart[p.id]).map((p) => ({ ...p, qtd: cart[p.id] })),
    [products, cart]
  );
  const total = items.reduce((s, i) => s + i.qtd * Number(i.preco), 0);
  const totalUnits = items.reduce((s, i) => s + i.qtd, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => !q || p.nome.toLowerCase().includes(q));
  }, [products, query]);

  const finish = async () => {
    setBusy(true);
    try {
      await registerSale(items.map((i) => ({ produto_id: i.id, quantidade: i.qtd })));
      setCart({});
      setQuery('');
      await load();
      setToast(`Venda de ${formatMoney(total)} registrada.`);
    } catch (e) {
      Alert.alert('Não foi possível registrar a venda', e.message);
      load();
    } finally {
      setBusy(false);
    }
  };

  const confirm = () =>
    Alert.alert('Finalizar venda', `${totalUnits} item(ns) · Total ${formatMoney(total)}`, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Confirmar', onPress: finish },
    ]);

  if (loading) return <Loading />;

  return (
    <Screen>
      <View style={{ padding: 12 }}>
        <Searchbar placeholder="Buscar produto" value={query} onChangeText={setQuery} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={
          <EmptyState
            title={products.length ? 'Nenhum produto encontrado' : 'Cadastre produtos para vender'}
            actionLabel={products.length ? undefined : 'Cadastrar produto'}
            onAction={() => navigation.navigate('ProductForm')}
          />
        }
        renderItem={({ item }) => {
          const qtd = cart[item.id] || 0;
          const out = item.quantidade <= 0;
          return (
            <List.Item
              title={item.nome}
              description={`${formatMoney(item.preco)} · ${out ? 'Sem estoque' : `${item.quantidade} disponíveis`}`}
              titleStyle={out ? { opacity: 0.5 } : undefined}
              right={() => (
                <View style={styles.stepper}>
                  <IconButton icon="minus-circle-outline" disabled={qtd === 0} onPress={() => change(item, -1)} />
                  <Text variant="titleMedium" style={styles.qtd}>{qtd}</Text>
                  <IconButton icon="plus-circle" iconColor={theme.colors.primary} disabled={out || qtd >= item.quantidade}
                    onPress={() => change(item, 1)} />
                </View>
              )}
            />
          );
        }}
      />

      <Surface style={styles.bar} elevation={4}>
        <View>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>{totalUnits} item(ns)</Text>
          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>{formatMoney(total)}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {items.length > 0 && <Button onPress={() => setCart({})}>Limpar</Button>}
          <Button mode="contained" icon="check" onPress={confirm} disabled={items.length === 0 || busy} loading={busy}>
            Finalizar
          </Button>
        </View>
      </Surface>

      <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={3500} style={{ marginBottom: 80 }}>
        {toast}
      </Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center' },
  qtd: { minWidth: 24, textAlign: 'center' },
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
});
