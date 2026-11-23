import { supabase } from '../lib/supabase';

export async function listProducts() {
  const { data, error } = await supabase.from('produtos').select('*').order('nome', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createProduct(p) {
  const { data, error } = await supabase.from('produtos').insert(p).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, p) {
  const { data, error } = await supabase.from('produtos').update(p).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('produtos').delete().eq('id', id);
  if (error) throw error;
}

export const isLowStock = (p) => p.quantidade <= p.estoque_minimo;
