import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, List, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import Loading from '../components/Loading';
import { buildReport, PERIODS } from '../services/reportsService';
import { formatMoney } from '../utils/format';

export default function ReportsScreen() {
  const theme = useTheme();
  const [period, setPeriod] = useState('semana');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setReport(await buildReport(period));
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [period]));

  const max = report ? Math.max(...report.porDia.map((d) => d.total), 1) : 1;
  const manyDays = report && report.porDia.length > 10;

  return (
    <Screen>
      <View style={styles.chips}>
        {Object.entries(PERIODS).map(([k, v]) => (
          <Chip key={k} selected={period === k} onPress={() => setPeriod(k)}>{v.label}</Chip>
        ))}
      </View>

      {loading || !report ? (
        <Loading />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          <Card>
            <Card.Content>
              <Text variant="labelLarge" style={{ opacity: 0.6 }}>Faturamento total</Text>
              <Text variant="displaySmall" style={{ fontWeight: '700', color: theme.colors.primary }}>
                {formatMoney(report.faturamento)}
              </Text>
              <View style={styles.stats}>
                <View>
                  <Text variant="titleMedium">{report.qtdVendas}</Text>
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>vendas</Text>
                </View>
                <View>
                  <Text variant="titleMedium">{formatMoney(report.ticketMedio)}</Text>
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>ticket médio</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {report.porDia.length > 1 && (
            <>
              <Text variant="titleMedium" style={styles.section}>Faturamento por dia</Text>
              <Card>
                <Card.Content>
                  <View style={styles.bars}>
                    {report.porDia.map((d, idx) => (
                      <View key={d.label + idx} style={styles.barCol}>
                        <View style={[styles.bar, {
                          height: Math.max((d.total / max) * 120, d.total > 0 ? 4 : 1),
                          backgroundColor: d.total > 0 ? theme.colors.primary : theme.colors.outline,
                        }]} />
                        {(!manyDays || idx % 5 === 0) && (
                          <Text style={styles.barLabel} numberOfLines={1}>{d.label}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </>
          )}

          <Text variant="titleMedium" style={styles.section}>Produtos mais vendidos</Text>
          {report.maisVendidos.length === 0 ? (
            <Text style={{ opacity: 0.6 }}>Sem vendas no período.</Text>
          ) : (
            <Card>
              {report.maisVendidos.map((p, i) => (
                <List.Item
                  key={p.nome}
                  title={p.nome}
                  description={formatMoney(p.valor)}
                  left={() => (
                    <View style={[styles.rank, { backgroundColor: theme.colors.primaryContainer }]}>
                      <Text style={{ fontWeight: '700' }}>{i + 1}</Text>
                    </View>
                  )}
                  right={() => (
                    <Text variant="titleMedium" style={{ alignSelf: 'center' }}>{p.quantidade} un.</Text>
                  )}
                />
              ))}
            </Card>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 8, padding: 12 },
  content: { padding: 12, paddingBottom: 32 },
  stats: { flexDirection: 'row', gap: 40, marginTop: 12 },
  section: { marginTop: 20, marginBottom: 8 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 2 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '70%', borderRadius: 3 },
  barLabel: { fontSize: 9, marginTop: 4, opacity: 0.7 },
  rank: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginLeft: 12 },
});
