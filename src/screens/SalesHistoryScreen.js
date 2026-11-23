import React, { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { Chip, List, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { listSalesSince } from '../services/salesService';
import { PERIODS } from '../services/reportsService';
import { dayKey, daysAgo, formatDate, formatMoney, formatTime } from '../utils/format';

export default function SalesHistoryScreen() {
  const [period, setPeriod] = useState('semana');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = async (p = period) => {
    try {
      setSales(await listSalesSince(daysAgo(PERIODS[p].days)));
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [period]));

  const sections = useMemo(() => {
    const map = {};
    sales.forEach((v) => {
      const k = dayKey(v.created_at);
      if (!map[k]) map[k] = { key: k, title: formatDate(v.created_at), total: 0, data: [] };
      map[k].total += Number(v.total);
      map[k].data.push(v);
    });
    return Object.values(map).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [sales]);

  const changePeriod = (p) => {
    setPeriod(p);
    setLoading(true);
  };

  return (
    <Screen>
      <View style={styles.chips}>
        {Object.entries(PERIODS).map(([k, v]) => (
          <Chip key={k} selected={period === k} onPress={() => changePeriod(k)}>{v.label}</Chip>
        ))}
      </View>

      {loading ? (
        <Loading />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(v) => v.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState title="Nenhuma venda no período" message="As vendas registradas aparecerão aqui." />}
          renderSectionHeader={({ section }) => (
            <View style={styles.header}>
              <Text variant="titleSmall">{section.title}</Text>
              <Text variant="titleSmall" style={{ fontWeight: '700' }}>{formatMoney(section.total)}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <List.Accordion
              title={formatMoney(item.total)}
              description={`${formatTime(item.created_at)} · ${item.itens_venda.reduce((s, i) => s + i.quantidade, 0)} item(ns)`}
              expanded={expanded === item.id}
              onPress={() => setExpanded(expanded === item.id ? null : item.id)}
              left={(props) => <List.Icon {...props} icon="receipt-text-outline" />}
              style={{ backgroundColor: '#fff' }}
            >
              {item.itens_venda.map((i) => (
                <List.Item
                  key={i.id}
                  title={`${i.quantidade}× ${i.nome_produto}`}
                  right={() => (
                    <Text style={{ alignSelf: 'center' }}>{formatMoney(i.quantidade * Number(i.preco_unitario))}</Text>
                  )}
                />
              ))}
            </List.Accordion>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 8, padding: 12 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#E6EDEB',
  },
});
