import { supabase } from '../lib/supabase';

// items: [{ produto_id, quantidade }]
export async function registerSale(items) {
  const { data, error } = await supabase.rpc('registrar_venda', { p_itens: items });
  if (error) throw error;
  return data;
}

// Vendas (com itens) a partir de uma data
export async function listSalesSince(sinceDate) {
  const { data, error } = await supabase
    .from('vendas')
    .select('id, total, created_at, itens_venda(id, nome_produto, quantidade, preco_unitario)')
    .gte('created_at', sinceDate.toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
