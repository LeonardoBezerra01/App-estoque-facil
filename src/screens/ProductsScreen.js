import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Chip, FAB, List, Searchbar, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { listProducts, isLowStock } from '../services/productsService';
import { formatMoney } from '../utils/format';
import { colors } from '../theme';

export default function ProductsScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setProducts(await listProducts());
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (route.params?.onlyLow) {
        setOnlyLow(true);
        navigation.setParams({ onlyLow: undefined });
      }
      load();
    }, [route.params?.onlyLow])
  );

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (onlyLow && !isLowStock(p)) return false;
      if (!q) return true;
      return p.nome.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q);
    });
  }, [products, query, onlyLow]);

  if (loading) return <Loading />;

  return (
    <Screen>
      <View style={styles.top}>
        <Searchbar placeholder="Buscar produto ou categoria" value={query} onChangeText={setQuery} />
        <View style={styles.chips}>
          <Chip selected={!onlyLow} onPress={() => setOnlyLow(false)}>Todos ({products.length})</Chip>
          <Chip selected={onlyLow} onPress={() => setOnlyLow(true)} icon="alert-outline">
            Estoque baixo ({products.filter(isLowStock).length})
          </Chip>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <EmptyState
            title={products.length ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            message={products.length ? 'Altere a busca ou o filtro.' : 'Cadastre seu primeiro produto para começar a vender.'}
            actionLabel={products.length ? undefined : 'Cadastrar produto'}
            onAction={() => navigation.navigate('ProductForm')}
          />
        }
        renderItem={({ item }) => {
          const low = isLowStock(item);
          return (
            <List.Item
              title={item.nome}
              description={`${item.categoria || 'Sem categoria'} · ${formatMoney(item.preco)}`}
              onPress={() => navigation.navigate('ProductForm', { product: item })}
              style={low ? { backgroundColor: colors.warnBg } : undefined}
              left={(props) => <List.Icon {...props} icon={low ? 'alert-outline' : 'package-variant-closed'} color={low ? colors.warn : undefined} />}
              right={() => (
                <View style={styles.qty}>
                  <Text variant="titleMedium" style={low ? { color: colors.warn, fontWeight: '700' } : undefined}>
                    {item.quantidade}
                  </Text>
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>em estoque</Text>
                </View>
              )}
            />
          );
        }}
      />

      <FAB icon="plus" label="Novo produto" style={styles.fab} onPress={() => navigation.navigate('ProductForm')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { padding: 12, gap: 10 },
  chips: { flexDirection: 'row', gap: 8 },
  qty: { alignItems: 'flex-end', justifyContent: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
