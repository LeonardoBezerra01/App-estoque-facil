import React, { useLayoutEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import Screen from '../components/Screen';
import { createProduct, deleteProduct, updateProduct } from '../services/productsService';
import { parseDecimal, parseIntSafe } from '../utils/format';

export default function ProductFormScreen({ navigation, route }) {
  const product = route.params?.product;
  const editing = !!product;

  const [nome, setNome] = useState(product?.nome ?? '');
  const [categoria, setCategoria] = useState(product?.categoria ?? '');
  const [preco, setPreco] = useState(product ? String(product.preco).replace('.', ',') : '');
  const [quantidade, setQuantidade] = useState(product ? String(product.quantidade) : '');
  const [minimo, setMinimo] = useState(product ? String(product.estoque_minimo) : '');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Editar produto' : 'Novo produto' });
  }, [navigation, editing]);

  const validate = () => {
    const e = {};
    const p = parseDecimal(preco);
    const q = parseIntSafe(quantidade);
    const m = parseIntSafe(minimo === '' ? '0' : minimo);
    if (!nome.trim()) e.nome = 'Informe o nome do produto.';
    if (Number.isNaN(p) || p < 0) e.preco = 'Informe um preço válido, ex.: 12,50.';
    if (Number.isNaN(q) || q < 0) e.quantidade = 'Informe a quantidade em número inteiro.';
    if (Number.isNaN(m) || m < 0) e.minimo = 'Informe o estoque mínimo em número inteiro.';
    setErrors(e);
    return Object.keys(e).length === 0
      ? { nome: nome.trim(), categoria: categoria.trim() || null, preco: p, quantidade: q, estoque_minimo: m }
      : null;
  };

  const save = async () => {
    const payload = validate();
    if (!payload) return;
    setBusy(true);
    try {
      if (editing) await updateProduct(product.id, payload);
      else await createProduct(payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Não foi possível salvar', e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    Alert.alert('Excluir produto', `Excluir "${product.nome}"? O histórico de vendas será mantido.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Erro', e.message);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextInput label="Nome do produto" mode="outlined" value={nome} onChangeText={setNome} error={!!errors.nome} />
          <HelperText type="error" visible={!!errors.nome}>{errors.nome}</HelperText>

          <TextInput label="Categoria (opcional)" mode="outlined" value={categoria} onChangeText={setCategoria} />
          <HelperText type="info" visible={false}> </HelperText>

          <TextInput label="Preço de venda (R$)" mode="outlined" value={preco} onChangeText={setPreco}
            keyboardType="decimal-pad" error={!!errors.preco} left={<TextInput.Affix text="R$" />} />
          <HelperText type="error" visible={!!errors.preco}>{errors.preco}</HelperText>

          <TextInput label="Quantidade em estoque" mode="outlined" value={quantidade} onChangeText={setQuantidade}
            keyboardType="number-pad" error={!!errors.quantidade} />
          <HelperText type="error" visible={!!errors.quantidade}>{errors.quantidade}</HelperText>

          <TextInput label="Estoque mínimo para alerta" mode="outlined" value={minimo} onChangeText={setMinimo}
            keyboardType="number-pad" error={!!errors.minimo} />
          <HelperText type={errors.minimo ? 'error' : 'info'} visible>
            {errors.minimo || 'Você será avisado quando o estoque chegar a esse valor ou menos.'}
          </HelperText>

          <Button mode="contained" onPress={save} loading={busy} disabled={busy} contentStyle={{ paddingVertical: 6 }} style={{ marginTop: 8 }}>
            Salvar produto
          </Button>
          {editing && (
            <Button mode="outlined" textColor="#B3261E" onPress={remove} style={{ marginTop: 12 }}>
              Excluir produto
            </Button>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { padding: 16, paddingBottom: 40 } });
